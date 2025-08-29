# Waifu Videos

Place your waifu MP4 videos here with the following naming convention:
- waifu-00.mp4
- waifu-01.mp4
- waifu-02.mp4

The videos will be displayed in a loop in the chat interface.

## Video Controls

The WaifuVideo component provides these functions accessible from the browser console:

```javascript
// Play specific video by index (0, 1, or 2)
waifuVideo.playVideo(0);

// Play a random video
waifuVideo.playRandomVideo();

// Play next video in sequence
waifuVideo.playNextVideo();

// Get current video index
waifuVideo.currentIndex;
```

You can also import and use these controls programmatically:

```javascript
import { waifuVideoControls } from '@/components/WaifuVideo';

// Trigger video changes based on events
waifuVideoControls.playRandomVideo();
waifuVideoControls.playVideo(1);
waifuVideoControls.playNextVideo();
```