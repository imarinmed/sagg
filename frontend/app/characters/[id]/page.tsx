"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Chip,
  Separator,
  Avatar,
  Skeleton,
  ScrollShadow,
  Accordion,
} from "@heroui/react";
import { User, Heart, AlertTriangle, TrendingUp, ChevronDown } from "lucide-react";
import { IntensityBadge } from "@/components/IntensitySlider";
import { api } from "@/lib/api";

interface KinkPreference {
  id: string;
  intensity: number;
  notes: string;
}

interface KinkEvolution {
  [episode: string]: KinkPreference[];
}

interface KinkProfile {
  preferences: KinkPreference[];
  limits: KinkPreference[];
  evolution: KinkEvolution;
}

interface Character {
  id: string;
  name: string;
  portrayed_by?: string;
  role?: string;
  description?: string;
  family?: string | null;
  canonical_traits: string[];
  adaptation_traits: string[];
  adaptation_notes: string;
  kink_profile: {
    preferences: Array<{
      descriptor: string;
      intensity: number;
      context?: string;
    }>;
    limits: Array<{
      descriptor: string;
      type: string;
      note?: string;
    }>;
    evolution: Array<{
      episode_id: string;
      descriptors: Record<string, number>;
    }>;
  };
}

const categoryColors: Record<string, string> = {
  consent_frameworks: "bg-blue-100 text-blue-800",
  power_exchange: "bg-purple-100 text-purple-800",
  roles: "bg-green-100 text-green-800",
  physical_acts: "bg-red-100 text-red-800",
  psychological_dynamics: "bg-orange-100 text-orange-800",
  vampire_specific: "bg-violet-100 text-violet-800",
  taboo_elements: "bg-rose-100 text-rose-800",
  relationship_structures: "bg-cyan-100 text-cyan-800",
  aftercare_safety: "bg-emerald-100 text-emerald-800",
  content_warnings: "bg-amber-100 text-amber-800",
};

const categoryLabels: Record<string, string> = {
  consent_frameworks: "Consent",
  power_exchange: "Power Exchange",
  roles: "Roles",
  physical_acts: "Physical Acts",
  psychological_dynamics: "Psychological",
  vampire_specific: "Vampire",
  taboo_elements: "Taboo",
  relationship_structures: "Relationships",
  aftercare_safety: "Aftercare",
  content_warnings: "Warnings",
};

export default function CharacterDetailPage() {
  const params = useParams();
  const characterId = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const data = await api.characters.get(characterId);
        setCharacter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load character");
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      fetchCharacter();
    }
  }, [characterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-500">{error || "Character not found"}</p>
      </div>
    );
  }

  // Determine if vampire based on canonical_traits
  const isVampire = character.canonical_traits?.includes("vampire") || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-start gap-6">
            <Avatar
              className={`w-24 h-24 text-2xl ${
                isVampire
                  ? "bg-gradient-to-br from-red-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-cyan-600"
              }`}
            >
              <Avatar.Fallback className="text-white font-bold">
                {character.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{character.name}</h1>
                <Chip
                  color={isVampire ? "danger" : "accent"}
                  variant="soft"
                  size="sm"
                >
                  {character.role ? "Character" : "Unknown"}
                </Chip>
              </div>
              <p className="text-default-500">
                {character.portrayed_by ? `Portrayed by ${character.portrayed_by}` : "Actor unknown"}
              </p>
              <div className="flex gap-4 mt-4 text-sm text-default-600">
                {character.description && (
                  <span className="truncate">{character.description}</span>
                )}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

       {/* Main Content */}
       <Tabs>
         <Tabs.ListContainer>
           <Tabs.List aria-label="Character sections">
             <Tabs.Tab id="overview">
               <div className="flex items-center gap-2">
                 <User className="w-4 h-4" />
                 <span>Overview</span>
               </div>
               <Tabs.Indicator />
             </Tabs.Tab>
             <Tabs.Tab id="kink-profile">
               <div className="flex items-center gap-2">
                 <Heart className="w-4 h-4" />
                 <span>Kink Profile</span>
               </div>
               <Tabs.Indicator />
             </Tabs.Tab>
             <Tabs.Tab id="evolution">
               <div className="flex items-center gap-2">
                 <TrendingUp className="w-4 h-4" />
                 <span>Evolution</span>
               </div>
               <Tabs.Indicator />
             </Tabs.Tab>
           </Tabs.List>
         </Tabs.ListContainer>

         <Tabs.Panel id="overview" className="mt-4">
           <div className="space-y-6">
             {/* Canonical Info */}
             <Card>
               <Card.Header>
                 <h3 className="text-lg font-semibold">Canonical Traits</h3>
               </Card.Header>
               <Card.Content>
                 <div className="flex flex-wrap gap-2">
                   {character.canonical_traits.map((trait) => (
                     <Chip key={trait} variant="soft" size="sm">
                       {trait}
                     </Chip>
                   ))}
                 </div>
               </Card.Content>
             </Card>

             {/* Dark Adaptation */}
             <Card className="border-danger-200">
               <Card.Header className="bg-danger-50">
                 <h3 className="text-lg font-semibold text-danger-700">
                   Dark Adaptation
                 </h3>
               </Card.Header>
               <Card.Content className="space-y-4">
                 <div>
                   <h4 className="font-medium mb-2">Adaptation Notes</h4>
                   <p className="text-default-600">
                     {character.adaptation_notes || "Not yet defined"}
                   </p>
                 </div>

                 {character.adaptation_traits && character.adaptation_traits.length > 0 && (
                   <div>
                     <h4 className="font-medium mb-2">Added Traits</h4>
                     <div className="flex flex-wrap gap-2">
                       {character.adaptation_traits.map((trait) => (
                         <Chip key={trait} color="danger" variant="soft" size="sm">
                           {trait}
                         </Chip>
                       ))}
                     </div>
                   </div>
                 )}
               </Card.Content>
             </Card>
           </div>
         </Tabs.Panel>

         <Tabs.Panel id="kink-profile" className="mt-4">
           <div className="space-y-6">
             {/* Preferences */}
             <Card>
               <Card.Header>
                 <h3 className="text-lg font-semibold">Preferences</h3>
               </Card.Header>
               <Card.Content>
                 <ScrollShadow className="max-h-[400px]">
                   <div className="space-y-3">
                     {character.kink_profile.preferences.map((pref, idx) => (
                       <div
                         key={idx}
                         className="p-4 bg-default-50 rounded-lg"
                       >
                         <div className="flex items-center justify-between mb-2">
                           <span className="font-medium capitalize">
                             {pref.descriptor.replace(/_/g, " ")}
                           </span>
                           <IntensityBadge value={pref.intensity} />
                         </div>
                         {pref.context && (
                           <p className="text-sm text-default-500">{pref.context}</p>
                         )}
                       </div>
                     ))}
                   </div>
                 </ScrollShadow>
               </Card.Content>
             </Card>

             {/* Limits */}
             <Card>
               <Card.Header>
                 <h3 className="text-lg font-semibold">Limits</h3>
               </Card.Header>
               <Card.Content>
                 <div className="space-y-3">
                   {character.kink_profile.limits.map((limit, idx) => (
                     <div
                       key={idx}
                       className="p-4 bg-danger-50 rounded-lg border border-danger-200"
                     >
                       <div className="flex items-center justify-between mb-2">
                         <span className="font-medium capitalize text-danger-700">
                           {limit.descriptor.replace(/_/g, " ")}
                         </span>
                         <Chip size="sm" color="danger" variant="soft">
                           Type: {limit.type}
                         </Chip>
                       </div>
                       {limit.note && (
                         <p className="text-sm text-danger-600">{limit.note}</p>
                       )}
                     </div>
                   ))}
                 </div>
               </Card.Content>
             </Card>
           </div>
         </Tabs.Panel>

         <Tabs.Panel id="evolution" className="mt-4">
           <div className="space-y-6">
             <Accordion>
               {character.kink_profile.evolution.map((evo) => (
                 <Accordion.Item key={evo.episode_id}>
                   <Accordion.Heading>
                     <Accordion.Trigger>
                       <span className="font-semibold uppercase">{evo.episode_id}</span>
                       <Chip size="sm" variant="soft" className="ml-2">
                         {Object.keys(evo.descriptors).length} descriptors
                       </Chip>
                       <Accordion.Indicator>
                         <ChevronDown className="w-4 h-4" />
                       </Accordion.Indicator>
                     </Accordion.Trigger>
                   </Accordion.Heading>
                   <Accordion.Panel>
                     <Accordion.Body>
                       <div className="space-y-3">
                         {Object.entries(evo.descriptors).map(([descriptor, intensity]) => (
                           <div
                             key={descriptor}
                             className="p-3 bg-default-50 rounded-lg"
                           >
                             <div className="flex items-center justify-between">
                               <span className="font-medium capitalize">
                                 {descriptor.replace(/_/g, " ")}
                               </span>
                               <IntensityBadge value={intensity} />
                             </div>
                           </div>
                         ))}
                       </div>
                     </Accordion.Body>
                   </Accordion.Panel>
                 </Accordion.Item>
               ))}
             </Accordion>
           </div>
         </Tabs.Panel>

       </Tabs>
    </div>
  );
}
