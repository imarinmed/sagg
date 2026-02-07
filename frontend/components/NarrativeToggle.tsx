"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Checkbox,
} from "@heroui/react";
import { Book, Flame, AlertTriangle } from "lucide-react";
import { useNarrative, setStoredConsent, getStoredConsent } from "@/lib/narrative-context";

export function NarrativeToggle() {
  const { version, setVersion, isBST } = useNarrative();
  const [isOpen, setIsOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePress = () => {
    if (isBST) {
      const hasConsent = getStoredConsent();
      if (hasConsent) {
        setVersion("sst");
      } else {
        setIsOpen(true);
      }
    } else {
      setVersion("bst");
    }
  };

  const handleConfirmConsent = () => {
    if (consentGiven) {
      setStoredConsent(true);
      setVersion("sst");
      setIsOpen(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Button
        variant="ghost"
        className={`min-w-[140px] transition-all duration-300 ${
          isBST 
            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" 
            : "bg-red-900/20 text-red-500 hover:bg-red-900/30 border-red-900/30"
        }`}
        onPress={handlePress}
      >
        <div className="flex items-center gap-2">
          {isBST ? <Book size={16} /> : <Flame size={16} />}
          <span>{isBST ? "BST (Canon)" : "SST (Adaptation)"}</span>
        </div>
      </Button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={setIsOpen}
      >
        <div className="bg-[#0a0a0a] border border-red-900/30 shadow-[0_0_40px_rgba(139,0,0,0.2)] max-w-md w-full mx-4 rounded-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="p-6 border-b border-red-900/20">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={20} />
                <span className="font-heading tracking-wider">MATURE CONTENT WARNING</span>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                You are about to enable the <strong>SST (Adaptation)</strong> narrative layer.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                This version contains mature themes, explicit content, and dark psychological elements intended for adult audiences only.
              </p>
              
              <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4">
              <Checkbox 
                isSelected={consentGiven} 
                onChange={setConsentGiven}
                className="text-sm text-gray-300"
              >
                  I am 18 years of age or older and consent to view mature content.
                </Checkbox>
              </div>
            </div>
            
            <div className="p-6 border-t border-red-900/20 flex justify-end gap-3">
              <Button variant="ghost" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onPress={handleConfirmConsent}
                isDisabled={!consentGiven}
                className="bg-red-900 text-white shadow-lg shadow-red-900/20"
              >
                Enter SST Mode
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
