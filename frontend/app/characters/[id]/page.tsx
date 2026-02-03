"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Chip,
  Divider,
  Progress,
  Avatar,
  Skeleton,
  ScrollShadow,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { User, Heart, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
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
  portrayed_by: string;
  canonical: {
    age: number;
    species: string;
    family: string | null;
    traits: string[];
    arc: string;
    relationships: Array<{
      character: string;
      type: string;
      dynamic: string;
    }>;
  };
  adaptation: {
    age: number;
    traits_added: string[];
    arc_dark: string;
    taboo_elements: string[];
    explicit_scenes: string[];
    psychological_profile: string;
    power_dynamics: string;
  };
  kink_profile: KinkProfile;
  appearances: string[];
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
        const data = await api.getCharacter(characterId);
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

  const isVampire = character.canonical.species === "vampire";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-start gap-6">
            <Avatar
              name={character.name}
              className={`w-24 h-24 text-2xl ${
                isVampire
                  ? "bg-gradient-to-br from-red-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-cyan-600"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{character.name}</h1>
                <Chip
                  color={isVampire ? "danger" : "primary"}
                  variant="flat"
                  size="sm"
                >
                  {character.canonical.species}
                </Chip>
              </div>
              <p className="text-default-500">
                Portrayed by {character.portrayed_by}
              </p>
              <div className="flex gap-4 mt-4 text-sm text-default-600">
                <span>Age: {character.canonical.age}</span>
                {character.canonical.family && (
                  <span>Family: {character.canonical.family}</span>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content */}
      <Tabs aria-label="Character sections">
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Overview</span>
            </div>
          }
        >
          <div className="space-y-6 mt-4">
            {/* Canonical Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Canonical Traits</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {character.canonical.traits.map((trait) => (
                    <Chip key={trait} variant="flat" size="sm">
                      {trait}
                    </Chip>
                  ))}
                </div>
                <p className="mt-4 text-default-600">
                  <strong>Arc:</strong> {character.canonical.arc}
                </p>
              </CardBody>
            </Card>

            {/* Dark Adaptation */}
            <Card className="border-danger-200">
              <CardHeader className="bg-danger-50">
                <h3 className="text-lg font-semibold text-danger-700">
                  Dark Adaptation
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Dark Arc</h4>
                  <p className="text-default-600">
                    {character.adaptation.arc_dark || "Not yet defined"}
                  </p>
                </div>

                {character.adaptation.traits_added.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Added Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.adaptation.traits_added.map((trait) => (
                        <Chip key={trait} color="danger" variant="flat" size="sm">
                          {trait}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {character.adaptation.taboo_elements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Taboo Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.adaptation.taboo_elements.map((element) => (
                        <Chip key={element} color="warning" variant="flat" size="sm">
                          {element}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {character.adaptation.psychological_profile && (
                  <div>
                    <h4 className="font-medium mb-2">Psychological Profile</h4>
                    <p className="text-default-600 text-sm">
                      {character.adaptation.psychological_profile}
                    </p>
                  </div>
                )}

                {character.adaptation.power_dynamics && (
                  <div>
                    <h4 className="font-medium mb-2">Power Dynamics</h4>
                    <p className="text-default-600 text-sm">
                      {character.adaptation.power_dynamics}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Relationships */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Relationships</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {character.canonical.relationships.map((rel, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{rel.character}</span>
                        <Chip size="sm" variant="flat" className="ml-2">
                          {rel.type}
                        </Chip>
                      </div>
                      <span className="text-sm text-default-500">
                        {rel.dynamic}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="kink-profile"
          title={
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Kink Profile</span>
            </div>
          }
        >
          <div className="space-y-6 mt-4">
            {/* Preferences */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Preferences</h3>
              </CardHeader>
              <CardBody>
                <ScrollShadow className="max-h-[400px]">
                  <div className="space-y-3">
                    {character.kink_profile.preferences.map((pref) => (
                      <div
                        key={pref.id}
                        className="p-4 bg-default-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {pref.id.replace(/_/g, " ")}
                          </span>
                          <IntensityBadge value={pref.intensity} />
                        </div>
                        {pref.notes && (
                          <p className="text-sm text-default-500">{pref.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              </CardBody>
            </Card>

            {/* Limits */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Limits</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {character.kink_profile.limits.map((limit) => (
                    <div
                      key={limit.id}
                      className="p-4 bg-danger-50 rounded-lg border border-danger-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize text-danger-700">
                          {limit.id.replace(/_/g, " ")}
                        </span>
                        <Chip size="sm" color="danger" variant="flat">
                          Limit: {limit.intensity}/5
                        </Chip>
                      </div>
                      {limit.notes && (
                        <p className="text-sm text-danger-600">{limit.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="evolution"
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Evolution</span>
            </div>
          }
        >
          <div className="space-y-6 mt-4">
            <Accordion>
              {Object.entries(character.kink_profile.evolution).map(
                ([episode, preferences]) => (
                  <AccordionItem
                    key={episode}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-semibold uppercase">{episode}</span>
                        <Chip size="sm" variant="flat">
                          {preferences.length} tags
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-3 py-2">
                      {preferences.map((pref) => (
                        <div
                          key={pref.id}
                          className="p-3 bg-default-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {pref.id.replace(/_/g, " ")}
                            </span>
                            <IntensityBadge value={pref.intensity} />
                          </div>
                          {pref.notes && (
                            <p className="text-sm text-default-500 mt-1">
                              {pref.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </div>
        </Tab>

        <Tab
          key="appearances"
          title={
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Appearances</span>
            </div>
          }
        >
          <div className="mt-4">
            <Card>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {character.appearances.map((ep) => (
                    <Chip key={ep} variant="flat" color="primary">
                      {ep.toUpperCase()}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
