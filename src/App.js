import { Component } from 'react';
import { useReducer } from './iReact/react';
class ClassComponent extends Component {
  render() {
    return (
      <div className="border-class">
        <p>{this.props.name}</p>
      </div>
    );
  }
}

// fiber.memeorizedState(hook0) -> next(hook1) -> next(hook2) -> next(hook3) -> next(hook4)
// workInProressHook 指向的是最后一个 hook
function FunctionComponent(props) {
  const [count, setCount] = useReducer(x => x + 1, 0);

  return (
    <div className="border-func">
      <p>{props.name}</p>
      <button onClick={() => {
        setCount()
      }}>
      { `useReducer -> ${count}` }
      </button>
    </div>
  );
}

function FunctionComponent2(props) {
  const [count, setCount] = useReducer(x => x + 1, 0);
  
  return (
    <div className="border-func-2">
      <p>{props.name}</p>
      <button onClick={() => {
        setCount()
      }}>
      { `useReducer -> ${count}` }
      </button>
    </div>
  );
}

function App() {

  return (
    <div className="App">
      {/* <h1>全栈</h1>
      <a href="https://www.baidu.com/">Baidu</a> */}
      <FunctionComponent name="函数" />
      <ClassComponent name="class" />
      <FunctionComponent2 name="函数2"/>
    </div>
  );
}

export default App;
 