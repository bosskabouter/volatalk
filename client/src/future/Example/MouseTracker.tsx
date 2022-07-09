import React from 'react';

interface IMouseTrackerState {
  x: number;
  y: number;
}

export default class MouseTracker extends React.Component<
  Record<string, never>,
  IMouseTrackerState
> {
  constructor(props: Record<string, never>) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event: React.MouseEvent) {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  }

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        <h1>Move the mouse around!</h1>
        <p>
          The current mouse position is ({this.state.x}, {this.state.y})
        </p>
      </div>
    );
  }
}
