import React from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import { LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import awsLogo from './assets/aws.png';
import azureLogo from './assets/azure.png';
import digitaloceanLogo from './assets/digitalocean.png';
import googleLogo from './assets/google.png';
import upcloudLogo from './assets/upcloud.png';
import { Cloud } from './interface';
import * as state from './state/state';
import { sortByDistance } from './utils/utils';

enum cloudProviders { azure = 'Microsoft Azure', aws = 'Amazon Web Services', do = 'DigitalOcean', google = 'Google Cloud Platform', upcloud = 'UpCloud' };

function App() {
  const [clouds, setResponse] = React.useState(state.initialstate);
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = React.useState<boolean>(true);
  const [error, setError]: [string, (error: string) => void] = React.useState("");
  const [cloudProvider, setProvider] = React.useState(state.initialProvider);
  const [filteredClouds, setFiltered] = React.useState(state.initialstate);
  const [selectedCloud, setCloudSelection] = React.useState(state.initialCloudSelection)

  // Handle the state action for selecting a cloud provider
  const handleSelectProvider = (event: any, provider: string) => {
    setCloudSelection(state.initialCloudSelection);
    if (provider === null) {
      // Refresh selections and list
      setProvider(state.initialProvider);
      setFiltered(clouds);
    }
    else {
      // Select provider and filter cloud list
      setProvider(provider);
      const filtered = clouds.filter(cloud => cloud.provider === provider);
      setFiltered(filtered);
    }
  };

  // Handle the state action for selecting a cloud
  const handleSelectCloud = (event: any, cloud: Cloud) => {
    if(cloud === null) {
      setCloudSelection(state.initialCloudSelection);
    }
    else {
      setCloudSelection(cloud);
    }
  }

  // Initialize app by getting the list of clouds
  React.useEffect(() => {
    axios
      .get<Cloud[]>('http://localhost:80/clouds', {
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((response: AxiosResponse) => {
        sortByDistance(response.data.clouds).then(sortedList => {
          setResponse(sortedList);
          setFiltered(sortedList);
          setLoading(false);
        })
      })
      .catch(ex => {
        setError(ex.message);
        setLoading(false);
      });
  }, []);

  const cloudListRenderer = filteredClouds.map((cloud, i) => {
    while (i < 10) {
      return (
        <div className="clouds" key={i}>
          <ToggleButtonGroup orientation="vertical" value={selectedCloud} color="primary" size="large" exclusive onChange={handleSelectCloud}>
            <ToggleButton value={cloud} sx={{ border: 'none' }}>
              <div style={{ display: 'flex', flexFlow: 'column wrap', alignItems: 'flex-start' }}>
                <div className='cloud-name' >
                  {cloud.name}
                </div>
                <div>
                  {cloud.description}
                </div>
                <div>
                  {cloud.region}
                </div>
                <div className="cloud-distance">
                  {cloud.distance} km
                </div>
              </div>
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      );
    }
  });

  const content = loading ? (<LinearProgress></LinearProgress>) : (
    <div className="content">
      <div className="components">
        <div className="providers">
          <p className="component-header">Available Providers</p>
          <ToggleButtonGroup orientation="vertical" value={cloudProvider} color="primary" size="large" exclusive onChange={handleSelectProvider}>
            <ToggleButton className="toggle-button" sx={{ backgroundImage: `url(${azureLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }} value="azure">
            </ToggleButton>
            <ToggleButton className="toggle-button" sx={{ backgroundImage: `url(${awsLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }} value="aws">
            </ToggleButton>
            <ToggleButton className="toggle-button" sx={{ backgroundImage: `url(${digitaloceanLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }} value="do">
            </ToggleButton>
            <ToggleButton className="toggle-button" sx={{ backgroundImage: `url(${googleLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }} value="google">
            </ToggleButton>
            <ToggleButton className="toggle-button" sx={{ backgroundImage: `url(${upcloudLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }} value="upcloud">
            </ToggleButton>
          </ToggleButtonGroup>
          <div>
            <p className="selected-header">Selected Provider</p>
            <p>{cloudProviders[cloudProvider as keyof typeof cloudProviders]}</p>
          </div>
        </div>
        <div>
          <p className="component-header">Top 10 closest clouds to your location</p>
          {cloudListRenderer}
        </div>
        <div>
          <p className="component-header">Selected Cloud</p>
          <p>{selectedCloud.name}</p>
          <p>{selectedCloud.description}</p>
          <p>{cloudProviders[selectedCloud.provider as keyof typeof cloudProviders]}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <div className="App-header">Cloud Picker</div>
      <div>{content}</div>
      {error && <p className="error">{error}</p>}
    </div>
  );

}

export default App;
