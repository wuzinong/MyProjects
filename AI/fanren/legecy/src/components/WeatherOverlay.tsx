import React, { useMemo } from 'react';

interface WeatherOverlayProps {
  mapId: string;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ mapId }) => {
  const weatherType = useMemo(() => {
    switch (mapId) {
      case 'MAP001': return 'fog';
      case 'MAP002': return 'rain';
      case 'MAP003': return 'blood-rain';
      case 'MAP004': return 'snow';
      case 'MAP005': return 'storm';
      case 'MAP006': return 'toxic';
      case 'MAP007': return 'void';
      default: return 'none';
    }
  }, [mapId]);

  if (weatherType === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-100vh) translateX(0); }
          100% { transform: translateY(100vh) translateX(-20vw); }
        }
        @keyframes snow {
          0% { transform: translateY(-10vh) translateX(0); }
          100% { transform: translateY(100vh) translateX(20vw); }
        }
        @keyframes fog {
          0% { transform: translateX(-100vw); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes lightning {
          0%, 95%, 100% { opacity: 0; }
          96%, 98% { opacity: 0.8; }
          97%, 99% { opacity: 0.3; }
        }
        @keyframes toxicFloat {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }
        
        .weather-rain {
          background-image: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%);
          background-size: 2px 50px;
          animation: rain 0.6s linear infinite;
        }
        .weather-blood-rain {
          background-image: linear-gradient(to bottom, rgba(255,0,0,0) 0%, rgba(220,38,38,0.4) 100%);
          background-size: 3px 60px;
          animation: rain 0.5s linear infinite;
        }
        .weather-snow {
          background-image: radial-gradient(circle, rgba(255,255,255,0.8) 10%, transparent 20%);
          background-size: 100px 100px;
          background-position: 0 0, 50px 50px;
          animation: snow 10s linear infinite;
        }
        .weather-fog {
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          background-size: 200vw 100vh;
          animation: fog 20s linear infinite;
        }
        .weather-storm-clouds {
          background: rgba(0, 0, 0, 0.4);
        }
        .weather-lightning {
          background: white;
          mix-blend-mode: overlay;
          animation: lightning 7s infinite;
        }
        .weather-toxic {
          background-image: radial-gradient(circle, rgba(74, 222, 128, 0.4) 5%, transparent 15%);
          background-size: 60px 60px;
          animation: toxicFloat 8s linear infinite;
        }
        .weather-void {
          background-image: radial-gradient(circle, rgba(168, 85, 247, 0.6) 2%, transparent 10%);
          background-size: 150px 150px;
          animation: snow 15s linear infinite reverse;
        }
      `}</style>

      {weatherType === 'fog' && (
        <div className="absolute inset-0 weather-fog" />
      )}
      
      {weatherType === 'rain' && (
        <>
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-rain" style={{ backgroundSize: '1px 30px', animationDuration: '0.4s' }} />
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-rain" style={{ backgroundSize: '2px 50px', animationDuration: '0.6s', animationDelay: '0.2s' }} />
          <div className="absolute inset-0 bg-slate-900/20" />
        </>
      )}

      {weatherType === 'blood-rain' && (
        <>
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-blood-rain" style={{ backgroundSize: '2px 40px', animationDuration: '0.3s' }} />
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-blood-rain" style={{ backgroundSize: '3px 60px', animationDuration: '0.5s', animationDelay: '0.1s' }} />
          <div className="absolute inset-0 bg-red-950/30" />
        </>
      )}

      {weatherType === 'snow' && (
        <>
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-snow" style={{ backgroundSize: '80px 80px', animationDuration: '12s' }} />
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-snow" style={{ backgroundSize: '120px 120px', animationDuration: '8s', backgroundPosition: '30px 40px' }} />
          <div className="absolute inset-0 bg-slate-100/10" />
        </>
      )}

      {weatherType === 'storm' && (
        <>
          <div className="absolute inset-0 weather-storm-clouds" />
          <div className="absolute inset-0 weather-lightning" />
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-rain" style={{ backgroundSize: '3px 60px', animationDuration: '0.3s' }} />
        </>
      )}

      {weatherType === 'toxic' && (
        <>
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-toxic" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-0 w-[200vw] -left-[50vw] weather-toxic" style={{ animationDuration: '6s', animationDelay: '-3s', backgroundSize: '80px 80px' }} />
          <div className="absolute inset-0 bg-green-950/30 mix-blend-multiply" />
        </>
      )}

      {weatherType === 'void' && (
        <>
          <div className="absolute inset-0 weather-void" />
          <div className="absolute inset-0 weather-void" style={{ backgroundSize: '250px 250px', animationDuration: '20s', animationDelay: '-5s' }} />
          <div className="absolute inset-0 bg-purple-950/40 mix-blend-multiply" />
        </>
      )}
    </div>
  );
};
