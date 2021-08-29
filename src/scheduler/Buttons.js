import React, {Component} from "react";

export class Buttons extends Component {

  constructor(props) {
    super(props);

    this.setState({
      canUndo: false,
      canRedo: false
    });

    this.props.service.watch(() => {
      this.setState({
        canUndo: this.props.service.canUndo,
        canRedo: this.props.service.canRedo
      });
    });
  }

  doUndo() {
    if (typeof this.props.onUndo === "function") {
      this.props.onUndo();
    }
  }

  doRedo() {
    if (typeof this.props.onRedo === "function") {
      this.props.onRedo();
    }
  }

  render() {
    return <div className={"space"}>
      <button disabled={!this.state?.canUndo} onClick={event => this.doUndo()}>Undo</button>
      <button disabled={!this.state?.canRedo} onClick={event => this.doRedo()}>Redo</button>
    </div>;
  }

}
