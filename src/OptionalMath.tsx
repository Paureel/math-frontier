import {Component,lazy,Suspense} from 'react';
import type {ReactNode} from 'react';

const Formula=lazy(()=>import('./Formula'));
class FormulaBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<span role="status">The equation couldn’t be loaded. The explanation and sources are still available.</span>:this.props.children;}
}

export default function OptionalMath({value}:{value:string}) {
  return <FormulaBoundary key={value}><Suspense fallback={<span>Loading formula…</span>}><Formula value={value}/></Suspense></FormulaBoundary>;
}
