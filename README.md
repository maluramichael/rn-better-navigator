# Better navigator

[![Join the chat at https://gitter.im/Devnetik/react-native-better-navigator](https://badges.gitter.im/Devnetik/react-native-better-navigator.svg)](https://gitter.im/Devnetik/react-native-better-navigator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Wraps the react-native navigator and provides an easy to use navigation interface

*Handle the navigationbar inside the current route itself*

[![npm](https://img.shields.io/npm/dm/react-native-better-navigator.svg?maxAge=2592000)](https://www.npmjs.com/package/react-native-better-navigator)
[![npm](https://img.shields.io/npm/v/react-native-better-navigator.svg?maxAge=2592000)](https://www.npmjs.com/package/react-native-better-navigator)

## Getting started
```sh
npm install --save react-native-better-navigator
```

## Example

```javascript
import BetterNavigator from 'react-native-better-navigator';
class Application extends Component {
  constructor( props ) {
    super( props );

    this.router = this.router.bind( this );

    const routes = [
      [ 'DASHBOARD', Routes.Dashboard ],
      [ 'ANOTHER_ROUTE', Routes.AnotherRoute ],
    ];

    this.routeMap = new Map( routes );
  }

  render() {
    const initialRoute = { name: 'DASHBOARD', title: 'Dashboard' };

    const defaultComponents = {
      left: ()=> { return <Text>Back</Text> }
    };

    return (
      <BetterNavigator initialRoute={initialRoute}
                       routes={this.router}
                       defaultComponents={defaultComponents}
                       sceneStyle={{backgroundColor: 'white'}}
                       ref={'betterNavigator'}/>
    );
  }

  router( route ) {
    if ( !route ) return null;
    if ( !this.routeMap ) return null;
    if ( !this.routeMap.has( route.name ) ) return null;

    return this.routeMap.get( route.name );
  }
}

// Dashboard
class Dashboard extends Component {
  
  constructor(props){
    super(props);
  }
  
  render(){
    return (
      <View>
        <Text>Dashboard</Text>
        <TouchableHighlight onPress={()=>{this.props.navigator.push({name: 'ANOTHER_ROUTE', title: 'Another route'})}}>
          <Text>Route</Text>
        </TouchableHighlight>
      </View>
    )
  }
}
```

## Constribute

Comments, Issues and Pull Requests are welcomed!