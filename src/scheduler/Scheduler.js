import React, {Component} from 'react';
import {DayPilot, DayPilotScheduler} from "daypilot-pro-react";
import {UndoService} from "./UndoService";
import {History} from "./History";
import {Buttons} from "./Buttons";

class Scheduler extends Component {

  undoService = new UndoService();

  constructor(props) {
    super(props);

    this.state = {
      config: {
        timeHeaders: [{"groupBy":"Month"},{"groupBy":"Day","format":"d"}],
        scale: "Day",
        days: 30,
        startDate: "2021-09-01",
        rowMarginBottom: 1,
        onBeforeEventRender: args => {
          if (args.data.backColor) {
            args.data.borderColor = "darker";
            args.data.fontColor = "white";
          }
          args.data.barHidden = true;
        },
        eventDeleteHandling: "Update",
        onTimeRangeSelected: async (args) => {
          const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
          this.scheduler.clearSelection();
          if (modal.canceled) { return; }

          const e = {
            start: args.start,
            end: args.end,
            id: DayPilot.guid(),
            resource: args.resource,
            text: modal.result
          };
          this.scheduler.events.add(e);
          this.undoService.add(e, "Event added");
        },
        onEventMoved: (args) => {
          this.undoService.update(args.e.data, "Event moved");
        },
        onEventResized: (args) => {
          this.undoService.update(args.e.data, "Event resized");
        },
        onEventDeleted: (args) => {
          this.undoService.remove(args.e.data, "Event removed");
        },
        treeEnabled: true,
      }
    };
  }

  componentDidMount() {
    const events = [
      {
        id: 1,
        text: "Event 1",
        start: "2021-09-02T00:00:00",
        end: "2021-09-05T00:00:00",
        resource: "A",
        backColor: "#e69138"
      },
      {
        id: 2,
        text: "Event 2",
        start: "2021-09-03T00:00:00",
        end: "2021-09-10T00:00:00",
        resource: "C",
        backColor: "#6aa84f"
      },
      {
        id: 3,
        text: "Event 3",
        start: "2021-09-02T00:00:00",
        end: "2021-09-08T00:00:00",
        resource: "D",
        backColor: "#3d85c6"
      },
      {
        id: 4,
        text: "Event 3",
        start: "2021-09-04T00:00:00",
        end: "2021-09-10T00:00:00",
        resource: "F",
        backColor: "#cc4125"
      }
    ];

    const resources = [
      {name: "Resource A", id: "A"},
      {name: "Resource B", id: "B"},
      {name: "Resource C", id: "C"},
      {name: "Resource D", id: "D"},
      {name: "Resource E", id: "E"},
      {name: "Resource F", id: "F"},
      {name: "Resource G", id: "G"}
    ];

    // load resource and event data
    this.scheduler.update({
      events,
      resources
    });

    this.undoService.initialize(events);

  }

  undo() {
    const action = this.undoService.undo();

    switch (action.type) {
      case "add":
        // added, need to delete now
        this.scheduler.events.remove(action.id);
        break;
      case "remove":
        // removed, need to add now
        this.scheduler.events.add(action.previous);
        break;
      case "update":
        // updated
        this.scheduler.events.update(action.previous);
        break;
      default:
        throw new Error("Unexpected action");
    }
  }

  redo() {
    const action = this.undoService.redo();

    switch (action.type) {
      case "add":
        // added, need to re-add
        this.scheduler.events.add(action.current);
        break;
      case "remove":
        // removed, need to remove again
        this.scheduler.events.remove(action.id);
        break;
      case "update":
        // updated, use the new version
        this.scheduler.events.update(action.current);
        break;
      default:
        throw new Error("Unexpected action");
    }
  }

  render() {
    return <div>
        <Buttons service={this.undoService} onUndo={() => this.undo()} onRedo={() => this.redo()} />
        <DayPilotScheduler
          {...this.state.config}
          ref={component => {
            this.scheduler = component && component.control;
          }}
        />
        <h2>History</h2>
        <History service={this.undoService} />
      </div>;
  }
}

export default Scheduler;
