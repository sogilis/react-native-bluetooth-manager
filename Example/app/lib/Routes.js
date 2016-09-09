import React from 'react';
import { Navigator } from 'react-native';
import DeviceDiscovery from '../containers/DeviceDiscovery';
import DeviceDetail from '../containers/DeviceDetail';
import ServiceDetail from '../containers/ServiceDetail';

const renderScene = (route, navigator) => {
  const navigate = routeName => navigator.replace( { name: routeName } );

  if (route.name == 'DeviceDiscovery') {
    return <DeviceDiscovery navigator={navigate} />;
  }
  if (route.name == 'DeviceDetail') {
    return <DeviceDetail navigator={navigate} />;
  }
  if (route.name == 'ServiceDetail') {
    return <ServiceDetail navigator={navigate} />;
  }
};

const Routes = () => (
  <Navigator
    initialRoute={{ name: 'DeviceDiscovery' }}
    renderScene={ renderScene } />
);

export default Routes;

