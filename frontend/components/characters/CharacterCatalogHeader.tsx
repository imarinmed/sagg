import React from "react";
import { StaticCharacter } from "@/lib/characterData";
import { motion } from "framer-motion";
import { Fingerprint, User, Crown, Activity } from "lucide-react";

interface CharacterCatalogHeaderProps {
  character: StaticCharacter;
}

const TAGLINES: Record<string, string> = {
  kiara: "She doesn't know she's already been cataloged",
  elise: "Top of her class. Bottom of the hierarchy.",
  chloe: "Watching from the shadows she helped create",
  felicia: "Every queen needs her followers",
  desiree: "Elegance masks the hunger",
};

export const CharacterCatalogHeader: React.FC<CharacterCatalogHeaderProps> = ({
  character,
}) => {
  const tagline = TAGLINES[character.id] || character.description;
  const isVampire = character.species === "vampire";

  return (
    <div className="relative w-full overflow-hidden py-16 md:py-24 px-6 md:px-12 border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none select-none mix-blend-overlay">
        <Fingerprint className="w-96 h-96 text-white" />
      </div>
      
      {/* Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none"
        style={{ 
          background: isVampire 
            ? 'radial-gradient(circle, var(--blood-crimson), transparent)' 
            : 'radial-gradient(circle, var(--nordic-gold), transparent)' 
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8"
        >
          {/* Catalog ID & Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-mono text-white/50 uppercase tracking-wider">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 backdrop-blur-md">
              <Activity className="w-3 h-3 text-nordic-gold" />
              <span>ID: {character.id}</span>
            </div>
            
            {character.catalog_id && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-blood-crimson font-bold">BST</span>
                  <span>{character.catalog_id.bst}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-blood-crimson font-bold">SST</span>
                  <span>{character.catalog_id.sst}</span>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 backdrop-blur-md ml-auto md:ml-0">
              {isVampire ? (
                <Crown className="w-3 h-3 text-blood-crimson" />
              ) : (
                <User className="w-3 h-3 text-nordic-gold" />
              )}
              <span className={isVampire ? "text-blood-crimson" : "text-nordic-gold"}>
                {character.species}
              </span>
              <span className="w-px h-3 bg-white/20 mx-1" />
              <span className="text-white/70">{character.role}</span>
            </div>
          </div>

          {/* Character Name */}
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter text-white leading-[0.85] mix-blend-screen">
            {character.name}
          </h1>

          {/* Tagline */}
          <div className="flex items-start gap-6 max-w-3xl mt-4 pl-1">
            <div className="w-16 h-[1px] bg-gradient-to-r from-nordic-gold to-transparent mt-4 hidden md:block opacity-50" />
            <p className="font-body text-xl md:text-2xl italic text-white/70 font-light leading-relaxed tracking-wide">
              "{tagline}"
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
