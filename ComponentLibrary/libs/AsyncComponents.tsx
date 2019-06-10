import * as React from "react";

interface AsyncComponentState{
    Component: any;
}
export default function asyncComponent(getComponent: any): any  {
    class AsyncComponent extends React.Component<{},AsyncComponentState> {

        private _isMounted:boolean;
        constructor(props: any) {
            super(props);

            this.state = {
                Component: null
            };
        }

        async componentDidMount(){
            this._isMounted = true;
            const {default: Component} = await getComponent();
            if(this._isMounted){
                this.setState({
                    Component: Component
                });
            }

        }
        componentWillUnmount(){
            this._isMounted = false;
        }


        render() {
            const C = this.state.Component;
            return C ? <C {...this.props}/> : <div>Loading...</div>
        }
    }
    return AsyncComponent;

}
// const HomePage = asyncComponent(() => import('./pages/HomePage'));

