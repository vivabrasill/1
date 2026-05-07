import { useState, useRef, useEffect, useCallback } from "react";
 import logo from "@/assets/logo.png";
 import premio from "@/assets/premio.png";
import telaPopup from "@/assets/tela-popup.png";
import { Clover } from "lucide-react";
import PrizeIcon from "./PrizeIcon";

// Símbolos do slot com seus ícones e cores
const SYMBOLS = [
  { id: "10", value: "10", label: "REAIS", color: "blue" },
  { id: "20", value: "20", label: "REAIS", color: "red" },
  { id: "50", value: "50", label: "REAIS", color: "green" },
  { id: "100", value: "100", label: "REAIS", color: "orange" },
  { id: "1000", value: "1000", label: "REAIS", color: "cyan" },
  { id: "5000", value: "5000", label: "REAIS", color: "pink" },
  { id: "10000", value: "10000", label: "REAIS", color: "purple" },
  { id: "100mil", value: "100", label: "MIL", color: "gold" },
];

const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const SlotReel = ({ 
  spinning, 
  finalSymbol, 
  delay,
  isWinning
}: { 
  spinning: boolean; 
  finalSymbol: typeof SYMBOLS[0]; 
  delay: number;
  isWinning: boolean;
}) => {
  const [displayedSymbols, setDisplayedSymbols] = useState(() => 
    Array.from({ length: 3 }, getRandomSymbol)
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (spinning) {
      setShowWinAnimation(false);
      // Start spinning after delay
      const startTimer = setTimeout(() => {
        setIsSpinning(true);
        intervalRef.current = setInterval(() => {
          setDisplayedSymbols(Array.from({ length: 3 }, getRandomSymbol));
        }, 80);
      }, delay);
      
      // Stop spinning
      const stopTimer = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsSpinning(false);
        setDisplayedSymbols([getRandomSymbol(), finalSymbol, getRandomSymbol()]);
        
        // Start win animation after spin stops
        if (isWinning) {
          setTimeout(() => {
            setShowWinAnimation(true);
          }, 300);
        }
      }, 2000 + delay + Math.random() * 500);
      
      return () => {
        clearTimeout(startTimer);
        clearTimeout(stopTimer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [spinning, finalSymbol, delay, isWinning]);
  
  return (
    <div className="slot-column flex-1 h-72 overflow-hidden relative">
      <div 
        className={`flex flex-col transition-transform ${isSpinning ? 'duration-0' : 'duration-300'}`}
      >
        {displayedSymbols.map((symbol, idx) => {
          return (
            <div 
              key={idx} 
              className={`slot-icon h-24 flex items-center justify-center ${
                isSpinning ? 'blur-[1px]' : ''
            } ${idx === 1 ? 'scale-110' : 'opacity-50 scale-90'} ${
              idx === 1 && showWinAnimation ? 'animate-winner-pulse' : ''
            }`}
            >
              <PrizeIcon
                value={symbol.value}
                label={symbol.label}
                color={symbol.color}
                size={idx === 1 ? 72 : 56}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
 
 const SlotGame = () => {
   const [tentativas, setTentativas] = useState(10);
   const [isSpinning, setIsSpinning] = useState(false);
   const [showPopup, setShowPopup] = useState(false);
   const [showWelcome, setShowWelcome] = useState(true);
   const [clickCount, setClickCount] = useState(0);
  const [isWinningRound, setIsWinningRound] = useState(false);
  const [reelSymbols, setReelSymbols] = useState(() => [
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol(),
  ]);
   
   const audioRef = useRef<HTMLAudioElement>(null);
   
   useEffect(() => {
    // Auto-dismiss welcome after 6s
     const timer = setTimeout(() => {
       setShowWelcome(false);
    }, 6000);
     
     return () => clearTimeout(timer);
   }, []);
   
   const handleWelcomeClick = () => {
     setShowWelcome(false);
   };
   
   const handleSpin = () => {
     if (isSpinning || tentativas <= 0) return;
     
     const newClickCount = clickCount + 1;
     setClickCount(newClickCount);
     
     setIsSpinning(true);
     setTentativas(prev => prev - 1);
     
    // Generate new symbols for each reel
    // On second click, make it a winning spin (3 equal symbols)
    if (newClickCount === 2) {
      const winningSymbol = SYMBOLS[7]; // 100 MIL for jackpot
      setReelSymbols([winningSymbol, winningSymbol, winningSymbol]);
     setIsWinningRound(true);
    } else {
      setReelSymbols([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
     setIsWinningRound(false);
    }
     
     // Play sound after 0.7s
     setTimeout(() => {
       if (audioRef.current) {
         audioRef.current.currentTime = 0;
         audioRef.current.play();
       }
     }, 700);
     
     // Show popup on second click after 6s
     if (newClickCount === 2) {
       setTimeout(() => {
         setShowPopup(true);
      }, 4000);
     }
     
    // Re-enable button after 3s
     setTimeout(() => {
       setIsSpinning(false);
    }, 3500);
   };
   
   return (
     <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-6 overflow-hidden">
       {/* Welcome Overlay */}
       {showWelcome && (
         <div 
          className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 cursor-pointer animate-fade-in"
           onClick={handleWelcomeClick}
         >
           <img 
            src={telaPopup} 
            alt="Tesouro da Sorte - Tela de Boas-vindas" 
            className="w-full max-w-xs animate-scale-in drop-shadow-2xl rounded-2xl"
           />
           <p className="mt-8 text-foreground/80 text-lg animate-pulse">
             Toque para começar
           </p>
         </div>
       )}
       
       {/* Prize Popup */}
       {showPopup && (
         <div className="popup-overlay animate-fade-in">
           <div className="popup-content">
             <img 
               src={premio} 
               alt="Título Premiado" 
               className="w-full rounded-xl mb-6 shadow-glow"
             />
             <a 
              href="https://igamingpt2zip.vercel.app/"
               className="btn-resgate inline-block w-full"
             >
               🎉 RESGATAR PRÊMIO
             </a>
           </div>
         </div>
       )}
       
       {/* Logo */}
       <img 
         src={logo} 
         alt="Tesouro da Sorte" 
         className="w-64 max-w-[80%] mb-4 drop-shadow-xl"
       />
       
       {/* Instructions */}
       <p className="text-foreground text-center text-lg leading-relaxed mb-6 max-w-sm">
         Para vencer, você precisa ter 3 símbolos iguais na linha horizontal do meio, 
         destacada com um <span className="text-primary font-bold">dourado</span> nas bordas
       </p>
       
      {/* Slot Machine */}
      <div className="slot-container w-full max-w-sm p-4 shadow-glow-blue">
        <div className="bg-secondary/50 rounded-xl p-2 relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary rounded-br-lg" />
          
          {/* Slot reels */}
          <div className="flex gap-1 relative">
            {/* Gradient overlay top/bottom */}
            <div className="slot-frame" />
            
            {/* Win line highlight */}
            <div className="slot-highlight" />
            
            {/* Three reels */}
            <SlotReel spinning={isSpinning} finalSymbol={reelSymbols[0]} delay={0} isWinning={isWinningRound} />
            <SlotReel spinning={isSpinning} finalSymbol={reelSymbols[1]} delay={200} isWinning={isWinningRound} />
            <SlotReel spinning={isSpinning} finalSymbol={reelSymbols[2]} delay={400} isWinning={isWinningRound} />
          </div>
        </div>
        
        {/* Decorative trevos */}
        <div className="flex justify-between mt-3 px-4">
          <Clover className="text-blue-light opacity-60" size={24} />
          {/* Spin button in the center */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || tentativas <= 0}
            className={`btn-spin-inline transition-all duration-300 ${
              isSpinning ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            🍀
          </button>
          <Clover className="text-blue-light opacity-60" size={24} />
        </div>
       </div>
       
       {/* Audio */}
       <audio ref={audioRef}>
         <source src="/click.mp3" type="audio/mpeg" />
       </audio>
       
       {/* Instructions below slot */}
       <p className="text-foreground/80 text-center mt-6 text-base">
         Clique no trevo para girar
       </p>
       
       {/* Attempts counter */}
       <div className="mt-4 text-foreground text-xl flex items-center gap-3">
         <div className="flex gap-2">
           {[...Array(Math.min(tentativas, 10))].map((_, i) => (
             <span 
               key={i} 
               className="w-3 h-3 rounded-full bg-primary animate-glow-pulse"
               style={{ animationDelay: `${i * 0.1}s` }}
             />
           ))}
         </div>
         <span className="text-muted-foreground">
           <strong className="text-primary">{tentativas}</strong> tentativas
         </span>
       </div>
       
       {/* Footer link */}
       <button className="mt-6 text-muted-foreground underline text-sm hover:text-foreground transition-colors">
         Entenda os prêmios
       </button>
     </div>
   );
 };
 
 export default SlotGame;