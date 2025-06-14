
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  audioFileUrl: string;
  callId?: string;
}

export const AudioPlayer = ({ audioFileUrl, callId }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioFileUrl);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить аудиофайл",
        variant: "destructive",
      });
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentAudioUrl, toast]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      toast({
        title: "Ошибка воспроизведения",
        description: "Не удалось воспроизвести аудиофайл",
        variant: "destructive",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const downloadAudioFile = () => {
    try {
      const link = document.createElement('a');
      link.href = currentAudioUrl;
      link.download = `call_${callId || 'audio'}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Скачивание начато",
        description: "Аудиофайл начал скачиваться",
      });
    } catch (error) {
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать аудиофайл",
        variant: "destructive",
      });
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-gray-50 border rounded-lg p-4 space-y-3">
      <audio ref={audioRef} src={currentAudioUrl} preload="metadata" />
      
      {/* Основные контролы */}
      <div className="flex items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={skipBackward} disabled={isLoading}>
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button size="sm" onClick={togglePlay} className="w-12 h-12" disabled={isLoading}>
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button size="sm" variant="outline" onClick={skipForward} disabled={isLoading}>
          <SkipForward className="h-4 w-4" />
        </Button>
        
        <Button size="sm" variant="outline" onClick={downloadAudioFile}>
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Таймлайн */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Громкость */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-gray-500" />
        <Slider
          value={[volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="w-20"
        />
      </div>
    </div>
  );
};
