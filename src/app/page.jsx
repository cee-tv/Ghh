"use client";
import React from "react";

function MainComponent() {
  const [player, setPlayer] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const videoRef = useRef(null);
  const channels = [
    {
      name: "Channel 1",
      url: "your-manifest-url-1.mpd",
      key: "your-key-id-1",
      keyValue: "your-key-value-1",
    },
    {
      name: "Channel 2",
      url: "your-manifest-url-2.mpd",
      key: "your-key-id-2",
      keyValue: "your-key-value-2",
    },
  ];
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const initPlayer = async () => {
      const shaka = window.shaka;
      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        return;
      }

      const shakaPlayer = new shaka.Player(videoRef.current);
      setPlayer(shakaPlayer);

      shakaPlayer.addEventListener("error", (event) => {
        console.error("Error code", event.detail.code, "object", event.detail);
      });
    };

    initPlayer();

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  const loadChannel = async (channel) => {
    if (!player) return;

    try {
      const clearKeyConfig = {
        keySystem: "org.w3.clearkey",
        licenseServerUrl: "",
        advanced: {
          [channel.key]: channel.keyValue,
        },
      };

      player.configure({
        drm: {
          clearKeys: {
            [channel.key]: channel.keyValue,
          },
        },
      });

      await player.load(channel.url);
      setCurrentChannel(channel);
      videoRef.current.play();
    } catch (error) {
      console.error("Error loading channel:", error);
    }
  };
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current.muted = newMutedState;
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };
  const nextChannel = () => {
    const currentIndex = channels.findIndex(
      (ch) => ch.name === currentChannel?.name
    );
    const nextIndex = (currentIndex + 1) % channels.length;
    loadChannel(channels[nextIndex]);
  };
  const previousChannel = () => {
    const currentIndex = channels.findIndex(
      (ch) => ch.name === currentChannel?.name
    );
    const prevIndex =
      currentIndex <= 0 ? channels.length - 1 : currentIndex - 1;
    loadChannel(channels[prevIndex]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a]">
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-3/4 relative bg-black">
          <video ref={videoRef} className="w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f172a] to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={previousChannel}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-backward text-xl"></i>
                </button>
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-play text-2xl"></i>
                </button>
                <button
                  onClick={nextChannel}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-forward text-xl"></i>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <i
                    className={`fas fa-${
                      isMuted ? "volume-mute" : "volume-up"
                    } text-xl`}
                  ></i>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-blue-500"
                />
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <i
                    className={`fas fa-${
                      isFullscreen ? "compress" : "expand"
                    } text-xl`}
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/4 bg-[#1e293b] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-roboto text-2xl font-bold">
              Channels
            </h2>
            <span className="text-blue-400 text-sm">
              {channels.length} channels
            </span>
          </div>
          <div className="space-y-3">
            {channels.map((channel, index) => (
              <button
                key={index}
                onClick={() => loadChannel(channel)}
                className={`w-full p-4 rounded-lg flex items-center ${
                  currentChannel?.name === channel.name
                    ? "bg-blue-500 text-white"
                    : "bg-[#334155] text-gray-300 hover:bg-[#475569]"
                } transition-all duration-200 font-roboto`}
              >
                <i className="fas fa-tv mr-3"></i>
                <span>{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.6/shaka-player.compiled.js"></script>
    </div>
  );
}

export default MainComponent;