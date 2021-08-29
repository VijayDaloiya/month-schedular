import React, {Component} from "react";

export class History extends Component {

  constructor(props) {
    super(props);

    this.setState({
      position: 0,
      history: []
    });

    this.props.service.watch(args => {
      this.setState({
        history: args.history,
        position: args.position
      });
    });
  }

  render() {
    const list = this.state?.history.map((item, i) => {
      const highlighted = this.state?.position === i;
      const highlightedClass = highlighted ? "highlighted" : ""
      return <div key={i} className={`history-item ${highlightedClass}`}>{item.type} - {item.text}</div>;
    });
    const total = this.state?.history.length || 0;

    return <div className={"space"}>
      <div className={"space"} style={{color: "gray"}}>There are {total} items in the history:</div>
      {list}
      <div className={this.state?.history.length && this.state.position === this.state.history.length ? "highlighted": ""}></div>
    </div>;

  }
}


