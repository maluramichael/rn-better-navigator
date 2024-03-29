/**
 * Created by maluramichael on 16/08/16.
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    Platform,
    Navigator,
    BackAndroid,
    TouchableHighlight,
    AsyncStorage
} from 'react-native';
import {TextTitlebar, BackButton} from './components';
import Style from './style.js';
import {connect} from 'react-redux';

class BetterNavigator extends Component {

    /**********************************************************************
     * Component
     **********************************************************************/
    constructor (props) {
        super(props);

        /**********************************************************************
         * Navigator
         **********************************************************************/
        this.renderScene = this.renderScene.bind(this);
        this.renderNavigationBar   = this.renderNavigationBar.bind(this);
        this.createRouteMapper     = this.createRouteMapper.bind(this);
        this.mapTitleToRoute       = this.mapTitleToRoute.bind(this);
        this.mapLeftButtonToRoute  = this.mapLeftButtonToRoute.bind(this);
        this.mapRightButtonToRoute = this.mapRightButtonToRoute.bind(this);
        this.onRouteWillFocus      = this.onRouteWillFocus.bind(this);
        this.callRouteFunction     = this.callRouteFunction.bind(this);
        this.configureScene        = this.configureScene.bind(this);

        /**********************************************************************
         * Navigation bar
         **********************************************************************/
        this.onPressMenuButton = this.onPressMenuButton.bind(this);
        this.onPressBackButton     = this.onPressBackButton.bind(this);
        this.showNavigationBar     = this.showNavigationBar.bind(this);
        this.hideNavigationBar     = this.hideNavigationBar.bind(this);
        this.setNavigationBarColor = this.setNavigationBarColor.bind(this);

        this.state = {
            navigationBarColor :  '#333',
            navigationBarHidden : true
        };

        this.cachedRoutes = new Map();
    }

    render () {
        const sceneStyle = this.state.navigationBarHidden ? {marginTop : null} : {};

        return (
            <Navigator
                initialRoute={this.props.initialRoute}
                renderScene={this.renderScene}
                onWillFocus={this.onRouteWillFocus}
                navigationBar={this.renderNavigationBar()}
                configureScene={this.configureScene}
                sceneStyle={[Style.page, sceneStyle, this.props.sceneStyle]}
                ref={'navigator'}
            />
        );
    }

    /**********************************************************************
     * Navigation bar
     **********************************************************************/
    onPressMenuButton () {
        this.openSideMenu()
    }

    onPressBackButton () {
        if (this.refs.navigator.state.presentedIndex > 0) {
            this.refs.navigator.pop();
        }
    }

    showNavigationBar () {
        this.setState({navigationBarHidden : false});
    }

    hideNavigationBar () {
        this.setState({navigationBarHidden : true});
    }

    setNavigationBarColor (color) {
        this.setState({navigationBarColor : color});
    }

    /**********************************************************************
     * Navigator
     **********************************************************************/
    callRouteFunction (functionName, route, navigator, index, navState) {
        if (this.props.routes) {
            const Route = this.props.routes(route);
            if (Route && Route[functionName]) {
                return Route[functionName](route, navigator, index, navState);
            }
        }
        return null;
    }

    configureScene (route, routeStack) {
        const Route = this.props.routes(route);
        if (Route && Route.configureScene) {
            return Route.configureScene();
        } else if (this.props.defaultSceneConfigurations) {
            return this.props.defaultSceneConfigurations(route, routeStack);
        } else {
            return Navigator.SceneConfigs.PushFromRight;
        }
    }

    renderScene (route, navigator) {
        if (__DEV__) {
            console.log(route.name);
        }
        var ConnectedRoute = null;
        if (this.cachedRoutes.has(route.name)) {
            ConnectedRoute = this.cachedRoutes.get(route.name);
        } else {
            const Route = this.props.routes(route);
            if (Route) {
                const stateMapper  = Route.mapState ? Route.mapState : ()=> {
                    return {Store : {}}
                };
                const actionMapper = Route.mapActions ? Route.mapActions : ()=> {
                    return {Actions : {}}
                };

                ConnectedRoute = connect(stateMapper, actionMapper)(Route);
                this.cachedRoutes.set(route.name, ConnectedRoute);
            }
        }
        if (ConnectedRoute) {
            return <ConnectedRoute navigator={navigator} {...route.passProps} />;
        }
        return <Text>404</Text>;
    }

    renderNavigationBar () {
        if (this.state.navigationBarHidden) {
            return <View />;
        }

        const navigationBarStyle = {
            backgroundColor : this.state.navigationBarColor
        };

        return (
            <Navigator.NavigationBar
                routeMapper={this.createRouteMapper()}
                style={[Style.navigationBar, navigationBarStyle]}
            />
        );
    }

    mapTitleToRoute (route, navigator, index, navState) {
        const navigatorItem = this.callRouteFunction('navigationBarTitleBar', route, navigator, index, navState);
        if (navigatorItem) {
            return navigatorItem;
        }

        if (this.props.defaultComponents && this.props.defaultComponents.title) {
            return this.props.defaultComponents.title(...arguments);
        }

        return (
            <TextTitlebar title={route.title ? route.title.toUpperCase() : ''}
                          textStyle={[Style.titleBarText, route.titleTextStyle]}
                          containerStyle={[route.titleStyle]}
            />
        );
    }

    //route, navigator, index, navState
    mapLeftButtonToRoute (route, navigator, index) {
        const navigatorItem = this.callRouteFunction('navigationBarLeftButton', ...arguments);
        if (navigatorItem) {
            return navigatorItem;
        }

        if (index > 0) {
            if (this.props.defaultComponents && this.props.defaultComponents.backButton) {
                return this.props.defaultComponents.backButton(...arguments);
            } else {
                return <BackButton onPress={this.onPressBackButton} />;
            }
        }

        if (this.props.defaultComponents && this.props.defaultComponents.left) {
            return this.props.defaultComponents.left(...arguments);
        }

        return <View />;
    }

    //route, navigator, index, navState
    mapRightButtonToRoute () {
        const navigatorItem = this.callRouteFunction('navigationBarRightButton', ...arguments);
        if (navigatorItem) {
            return navigatorItem;
        }

        if (this.props.defaultComponents && this.props.defaultComponents.right) {
            return this.props.defaultComponents.right(...arguments);
        }

        return <View />;
    }

    createRouteMapper () {
        return {
            LeftButton :  this.mapLeftButtonToRoute,
            RightButton : this.mapRightButtonToRoute,
            Title :       this.mapTitleToRoute,
        }
    }

    onRouteWillFocus (nextRoute) {
        const titleBarColor     = this.callRouteFunction('navigationBarColor', nextRoute);
        const isTitleBarVisible = this.callRouteFunction('navigationBarVisible', nextRoute);

        if (typeof titleBarColor !== 'undefined' && titleBarColor !== null) {
            this.setNavigationBarColor(titleBarColor);
        }

        if (typeof isTitleBarVisible !== 'undefined' && isTitleBarVisible !== null) {
            isTitleBarVisible ? this.showNavigationBar() : this.hideNavigationBar();
        }
    }
}

BetterNavigator.defaultProps = {
    routes : new Map()
};

export default BetterNavigator;
