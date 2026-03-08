import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
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

  module IntentCategory {
    public func compare(intent1 : IntentCategory, intent2 : IntentCategory) : Order.Order {
      switch (intent1, intent2) {
        case (#hotel, #hotel) { #equal };
        case (#food, #food) { #equal };
        case (#finance, #finance) { #equal };
        case (#ticket, #ticket) { #equal };
        case (#unknown, #unknown) { #equal };
        case (#hotel, _) { #less };
        case (_, #hotel) { #greater };
        case (#food, _) { #less };
        case (_, #food) { #greater };
        case (#finance, _) { #less };
        case (_, #finance) { #greater };
        case (#ticket, _) { #less };
        case (_, #ticket) { #greater };
      };
    };
  };

  type ChatMessage = {
    id : Nat;
    userId : Principal;
    content : Text;
    intent : IntentCategory;
    entities : [(Text, Text)];
    timestamp : Int;
  };

  type TaskStatus = {
    #pending;
    #processing;
    #done;
    #failed;
  };

  type AutomationTask = {
    id : Nat;
    userId : Principal;
    category : IntentCategory;
    payload : Text;
    status : TaskStatus;
    createdAt : Int;
  };

  type BufferStatus = {
    #queued;
    #flushing;
    #synced;
    #failed;
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

  module ChatMessage {
    public func compare(message1 : ChatMessage, message2 : ChatMessage) : Order.Order {
      Nat.compare(message1.id, message2.id);
    };
  };

  module AutomationTask {
    public func compare(task1 : AutomationTask, task2 : AutomationTask) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  module BufferItem {
    public func compare(bufferItem1 : BufferItem, bufferItem2 : BufferItem) : Order.Order {
      Nat.compare(bufferItem1.id, bufferItem2.id);
    };
  };

  module CloudRecord {
    public func compare(cloudRecord1 : CloudRecord, cloudRecord2 : CloudRecord) : Order.Order {
      Nat.compare(cloudRecord1.id, cloudRecord2.id);
    };
  };

  var nextMessageId = 1;
  var nextTaskId = 1;
  var nextBufferId = 1;
  var nextCloudRecordId = 1;

  let messages = Map.empty<Principal, List.List<ChatMessage>>();
  let tasks = Map.empty<Principal, List.List<AutomationTask>>();
  let bufferQueue = List.empty<BufferItem>();
  let cloudRecords = List.empty<CloudRecord>();

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
      entities = [];
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
      case (?userMessages) {
        let array = userMessages.toArray();
        array.sort();
      };
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
      case (?userTasks) {
        let array = userTasks.toArray();
        array.sort();
      };
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

    bufferQueue.toArray().sort();
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
    let updatedBufferQueue = List.empty<BufferItem>();

    bufferQueue.forEach(func(item) {
      if (item.status == #queued) {
        let syncedItem = {
          id = item.id;
          taskId = item.taskId;
          retryCount = item.retryCount;
          queuedAt = item.queuedAt;
          status = #synced;
        };
        updatedBufferQueue.add(syncedItem);
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
        updatedBufferQueue.add(item);
      };
    });

    bufferQueue.clear();
    bufferQueue.addAll(updatedBufferQueue.values());
    flushedCount;
  };

  public query ({ caller }) func getCloudRecords() : async [CloudRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view cloud records");
    };

    cloudRecords.toArray().sort();
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

    {
      totalTasks = 0;
      totalMessages = 0;
      bufferSize = bufferQueue.size();
      syncedCount = 0;
      tasksByCategory = {
        hotel = 0;
        food = 0;
        finance = 0;
        ticket = 0;
      };
      successRate = 100;
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func pingExternalService(url : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can ping external services");
    };

    await OutCall.httpGetRequest(url, [], transform);
  };
};
