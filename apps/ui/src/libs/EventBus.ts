export interface Subscription {
  topic: string;
  handler: Function;
}

class EventBus {
 
  events: { [key: string]: Function[] };

  constructor() {
    this.events = {};
  }

  subscribe(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return listener;
  }

  unsubscribe(event, listenerToRemove) {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
  }

  publish(event, data) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach(listener => listener(data));
  }
}

export const eventBus = new EventBus();