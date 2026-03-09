import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  type IntentCategory = {
    #hotel;
    #food;
    #finance;
    #ticket;
    #unknown;
  };

  type TaskStatus = {
    #pending;
    #processing;
    #done;
    #failed;
  };

  type BufferStatus = {
    #queued;
    #flushing;
    #synced;
    #failed;
  };

  type ChatMessage = {
    id : Nat;
    userId : Principal;
    content : Text;
    intent : IntentCategory;
    timestamp : Int;
  };

  type AutomationTask = {
    id : Nat;
    userId : Principal;
    category : IntentCategory;
    payload : Text;
    status : TaskStatus;
    createdAt : Int;
  };

  type BufferItem = {
    id : Nat;
    taskId : Nat;
    retryCount : Nat;
    queuedAt : Int;
    status : BufferStatus;
  };

  type CloudRecord = {
    id : Nat;
    taskId : Nat;
    data : Text;
    syncedAt : Int;
    category : IntentCategory;
  };

  type Analytics = {
    totalTasks : Nat;
    totalMessages : Nat;
    bufferSize : Nat;
    syncedCount : Nat;
    tasksByCategory : {
      hotel : Nat;
      food : Nat;
      finance : Nat;
      ticket : Nat;
    };
    successRate : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextMessageId = 1;
  var nextTaskId = 1;
  var nextBufferId = 1;
  var nextCloudRecordId = 1;

  let messages = Map.empty<Principal, List.List<ChatMessage>>();
  let tasks = Map.empty<Principal, List.List<AutomationTask>>();
  var bufferQueue = List.empty<BufferItem>();
  var cloudRecords = List.empty<CloudRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func detectIntent(content : Text) : IntentCategory {
    if (content.contains(#text "hotel")) { #hotel }
    else if (content.contains(#text "food")) { #food }
    else if (content.contains(#text "finance")) { #finance }
    else if (content.contains(#text "ticket")) { #ticket }
    else { #unknown };
  };

  func parseStatus(status : Text) : TaskStatus {
    switch (status) {
      case ("pending") { #pending };
      case ("processing") { #processing };
      case ("done") { #done };
      case ("failed") { #failed };
      case (_) { #pending };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func sendMessage(content : Text) : async ChatMessage {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let intent = detectIntent(content);
    let message : ChatMessage = {
      id = nextMessageId;
      userId = caller;
      content;
      intent;
      timestamp = Time.now();
    };

    switch (messages.get(caller)) {
      case (?userMessages) {
        userMessages.add(message);
      };
      case (null) {
        let newList = List.empty<ChatMessage>();
        newList.add(message);
        messages.add(caller, newList);
      };
    };

    let task : AutomationTask = {
      id = nextTaskId;
      userId = caller;
      category = intent;
      payload = content;
      status = #pending;
      createdAt = Time.now();
    };

    switch (tasks.get(caller)) {
      case (?userTasks) {
        userTasks.add(task);
      };
      case (null) {
        let newList = List.empty<AutomationTask>();
        newList.add(task);
        tasks.add(caller, newList);
      };
    };

    nextMessageId += 1;
    nextTaskId += 1;
    message;
  };

  public query ({ caller }) func getMessages() : async [ChatMessage] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get messages");
    };

    switch (messages.get(caller)) {
      case (?userMessages) { userMessages.toArray() };
      case (null) { [] };
    };
  };

  func convertToIntentCategory(category : Text) : IntentCategory {
    switch (category) {
      case ("hotel") { #hotel };
      case ("food") { #food };
      case ("finance") { #finance };
      case ("ticket") { #ticket };
      case (_) { #unknown };
    };
  };

  public shared ({ caller }) func createTask(category : Text, payload : Text) : async AutomationTask {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let task : AutomationTask = {
      id = nextTaskId;
      userId = caller;
      category = convertToIntentCategory(category);
      payload;
      status = #pending;
      createdAt = Time.now();
    };

    switch (tasks.get(caller)) {
      case (?userTasks) {
        userTasks.add(task);
      };
      case (null) {
        let newList = List.empty<AutomationTask>();
        newList.add(task);
        tasks.add(caller, newList);
      };
    };

    nextTaskId += 1;
    task;
  };

  public query ({ caller }) func getTasks() : async [AutomationTask] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get tasks");
    };

    switch (tasks.get(caller)) {
      case (?userTasks) { userTasks.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func updateTaskStatus(taskId : Nat, status : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update task status");
    };

    let newStatus = parseStatus(status);

    for ((user, userTasks) in tasks.entries()) {
      let updatedTasks = userTasks.map<AutomationTask, AutomationTask>(
        func(thisTask) {
          if (thisTask.id == taskId) {
            {
              id = thisTask.id;
              userId = thisTask.userId;
              category = thisTask.category;
              payload = thisTask.payload;
              status = newStatus;
              createdAt = thisTask.createdAt;
            };
          } else {
            thisTask;
          };
        }
      );
      tasks.add(user, updatedTasks);
    };
    true;
  };

  public query ({ caller }) func getBufferQueue() : async [BufferItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view buffer queue");
    };

    bufferQueue.toArray();
  };

  public shared ({ caller }) func addToBuffer(taskId : Nat) : async BufferItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to buffer");
    };

    let bufferItem : BufferItem = {
      id = nextBufferId;
      taskId;
      retryCount = 0;
      queuedAt = Time.now();
      status = #queued;
    };

    bufferQueue.add(bufferItem);
    nextBufferId += 1;
    bufferItem;
  };

  public shared ({ caller }) func flushBuffer() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can flush buffer");
    };

    var flushedCount = 0;
    let newBuffer = List.empty<BufferItem>();

    for (item in bufferQueue.values()) {
      if (item.status == #queued) {
        let syncedItem = {
          id = item.id;
          taskId = item.taskId;
          retryCount = item.retryCount;
          queuedAt = item.queuedAt;
          status = #synced;
        };
        newBuffer.add(syncedItem);
        flushedCount += 1;

        let cloudRecord : CloudRecord = {
          id = nextCloudRecordId;
          taskId = item.taskId;
          data = "Task Data";
          syncedAt = Time.now();
          category = #unknown;
        };
        cloudRecords.add(cloudRecord);
        nextCloudRecordId += 1;
      } else {
        newBuffer.add(item);
      };
    };

    bufferQueue := newBuffer;
    flushedCount;
  };

  public query ({ caller }) func getCloudRecords() : async [CloudRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view cloud records");
    };

    cloudRecords.toArray();
  };

  public shared ({ caller }) func addCloudRecord(taskId : Nat, data : Text, category : Text) : async CloudRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add cloud records");
    };

    let cloudRecord : CloudRecord = {
      id = nextCloudRecordId;
      taskId;
      data;
      syncedAt = Time.now();
      category = convertToIntentCategory(category);
    };

    cloudRecords.add(cloudRecord);
    nextCloudRecordId += 1;
    cloudRecord;
  };

  public query ({ caller }) func getAnalytics() : async Analytics {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    var totalTasks = 0;
    var totalMessages = 0;
    var hotelCount = 0;
    var foodCount = 0;
    var financeCount = 0;
    var ticketCount = 0;
    var doneCount = 0;

    for ((user, userMessages) in messages.entries()) {
      totalMessages += userMessages.size();
    };

    for ((user, userTasks) in tasks.entries()) {
      for (task in userTasks.values()) {
        totalTasks += 1;
        switch (task.category) {
          case (#hotel) { hotelCount += 1 };
          case (#food) { foodCount += 1 };
          case (#finance) { financeCount += 1 };
          case (#ticket) { ticketCount += 1 };
          case (#unknown) {};
        };
        if (task.status == #done) {
          doneCount += 1;
        };
      };
    };

    let bufferSize = bufferQueue.size();
    let syncedCount = cloudRecords.size();

    let successRate = if (totalTasks == 0) {
      100;
    } else {
      (doneCount * 100) / totalTasks;
    };

    {
      totalTasks;
      totalMessages;
      bufferSize;
      syncedCount;
      tasksByCategory = {
        hotel = hotelCount;
        food = foodCount;
        finance = financeCount;
        ticket = ticketCount;
      };
      successRate;
    };
  };

  public shared ({ caller }) func pingExternalService(url : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can ping external services");
    };

    await OutCall.httpGetRequest(url, [], transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
