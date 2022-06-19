import { useEffect, useState } from 'react';

export default function useDevices() {
  const [devices, setDevices] = useState<{
    audioInputDevices: MediaDeviceInfo[];
    videoDevices: MediaDeviceInfo[];
  }>({ audioInputDevices: [], videoDevices: [] });

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const uniqueDevices: MediaDeviceInfo[] = [];

      const uniqueGroupIds = [];
      devices.forEach((device) => {
        if (!uniqueGroupIds.includes(device.groupId)) {
          uniqueDevices.push(device);
          uniqueGroupIds.push(device.groupId);
        }
      });

      const audioInputDevices: MediaDeviceInfo[] = [];
      const videoInputDevices: MediaDeviceInfo[] = [];

      uniqueDevices.map((uniqueDevice) => {
        if (uniqueDevice.kind === 'audioinput') {
          audioInputDevices.push(uniqueDevice);
          return;
        }

        if (uniqueDevice.kind === 'videoinput') {
          videoInputDevices.push(uniqueDevice);
          return;
        }
      });

      setDevices({ audioInputDevices: audioInputDevices, videoDevices: videoInputDevices });
    });
  }, []);

  // navigator.mediaDevices
  //   .getUserMedia({
  //     video: videoConstraints,
  //     audio: true,
  //   })
  //   .then((localMediaStream: MediaStream) => {
  //     setUserLocalStream(localMediaStream);
  //   });

  return devices;
}
