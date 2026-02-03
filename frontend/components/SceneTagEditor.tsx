"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Chip,
  Divider,
  Tabs,
  Tab,
  ScrollShadow,
} from "@heroui/react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { KinkTagSelector } from "./KinkTagSelector";
import { IntensitySlider, IntensityBadge } from "./IntensitySlider";

interface KinkDescriptor {
  id: string;
  name: string;
  description: string;
  intensity: number;
  category: string;
}

interface SceneTag {
  id: string;
  descriptor_id: string;
  intensity: number;
  notes: string;
}

interface SceneTagsData {
  content_warnings: SceneTag[];
  descriptors: SceneTag[];
}

interface SceneTagEditorProps {
  descriptors: KinkDescriptor[];
  value: SceneTagsData;
  onChange: (value: SceneTagsData) => void;
  episodeId?: string;
  sceneName?: string;
}

export function SceneTagEditor({
  descriptors,
  value,
  onChange,
  episodeId,
  sceneName,
}: SceneTagEditorProps) {
  const [activeTab, setActiveTab] = useState<"warnings" | "descriptors">("warnings");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SceneTag | null>(null);

  const getDescriptor = (id: string) =>
    descriptors.find((d) => d.id === id);

  const addTag = (descriptorId: string) => {
    const newTag: SceneTag = {
      id: `${Date.now()}-${descriptorId}`,
      descriptor_id: descriptorId,
      intensity: 3,
      notes: "",
    };

    if (activeTab === "warnings") {
      onChange({
        ...value,
        content_warnings: [...value.content_warnings, newTag],
      });
    } else {
      onChange({
        ...value,
        descriptors: [...value.descriptors, newTag],
      });
    }
  };

  const removeTag = (tagId: string) => {
    if (activeTab === "warnings") {
      onChange({
        ...value,
        content_warnings: value.content_warnings.filter((t) => t.id !== tagId),
      });
    } else {
      onChange({
        ...value,
        descriptors: value.descriptors.filter((t) => t.id !== tagId),
      });
    }
  };

  const updateTag = (tagId: string, updates: Partial<SceneTag>) => {
    if (activeTab === "warnings") {
      onChange({
        ...value,
        content_warnings: value.content_warnings.map((t) =>
          t.id === tagId ? { ...t, ...updates } : t
        ),
      });
    } else {
      onChange({
        ...value,
        descriptors: value.descriptors.map((t) =>
          t.id === tagId ? { ...t, ...updates } : t
        ),
      });
    }
  };

  const startEdit = (tag: SceneTag) => {
    setEditingTag(tag.id);
    setEditForm({ ...tag });
  };

  const saveEdit = () => {
    if (editingTag && editForm) {
      updateTag(editingTag, editForm);
      setEditingTag(null);
      setEditForm(null);
    }
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setEditForm(null);
  };

  const currentTags = activeTab === "warnings" ? value.content_warnings : value.descriptors;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-lg font-semibold">Scene Tags</h3>
            {episodeId && sceneName && (
              <p className="text-sm text-default-500">
                {episodeId} - {sceneName}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Chip size="sm" variant="flat" color="warning">
              {value.content_warnings.length} Warnings
            </Chip>
            <Chip size="sm" variant="flat" color="primary">
              {value.descriptors.length} Descriptors
            </Chip>
          </div>
        </div>
      </CardHeader>

      <CardBody className="gap-4">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as "warnings" | "descriptors")}
        >
          <Tab
            key="warnings"
            title={
              <div className="flex items-center gap-2">
                <span>Content Warnings</span>
                <Chip size="sm" variant="flat">
                  {value.content_warnings.length}
                </Chip>
              </div>
            }
          >
            <div className="space-y-4">
              <KinkTagSelector
                descriptors={descriptors.filter(
                  (d) => d.category === "content_warnings"
                )}
                selectedIds={value.content_warnings.map((t) => t.descriptor_id)}
                onChange={(ids) => {
                  // Remove tags that are no longer selected
                  const currentIds = value.content_warnings.map((t) => t.descriptor_id);
                  const removedIds = currentIds.filter((id) => !ids.includes(id));
                  const addedIds = ids.filter((id) => !currentIds.includes(id));

                  let newWarnings = value.content_warnings.filter(
                    (t) => !removedIds.includes(t.descriptor_id)
                  );

                  addedIds.forEach((id) => {
                    newWarnings.push({
                      id: `${Date.now()}-${id}`,
                      descriptor_id: id,
                      intensity: 4,
                      notes: "",
                    });
                  });

                  onChange({ ...value, content_warnings: newWarnings });
                }}
                placeholder="Add content warnings..."
              />

              <ScrollShadow className="max-h-[300px]">
                <div className="space-y-2">
                  {value.content_warnings.map((tag) => {
                    const descriptor = getDescriptor(tag.descriptor_id);
                    if (!descriptor) return null;

                    const isEditing = editingTag === tag.id;

                    return (
                      <Card key={tag.id} className="bg-default-50">
                        <CardBody className="p-3">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="font-medium">{descriptor.name}</span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="light"
                                    color="success"
                                    onPress={saveEdit}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="light"
                                    color="danger"
                                    onPress={cancelEdit}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <IntensitySlider
                                value={editForm?.intensity || 3}
                                onChange={(val) =>
                                  setEditForm((prev) =>
                                    prev ? { ...prev, intensity: val } : null
                                  )
                                }
                                label="Warning Level"
                              />
                              <Textarea
                                label="Notes"
                                value={editForm?.notes || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev ? { ...prev, notes: e.target.value } : null
                                  )
                                }
                                size="sm"
                                placeholder="Add context or trigger details..."
                              />
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{descriptor.name}</span>
                                  <IntensityBadge value={tag.intensity} />
                                </div>
                                {tag.notes && (
                                  <p className="text-sm text-default-500 mt-1">
                                    {tag.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  onPress={() => startEdit(tag)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  color="danger"
                                  onPress={() => removeTag(tag.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </ScrollShadow>
            </div>
          </Tab>

          <Tab
            key="descriptors"
            title={
              <div className="flex items-center gap-2">
                <span>Scene Descriptors</span>
                <Chip size="sm" variant="flat">
                  {value.descriptors.length}
                </Chip>
              </div>
            }
          >
            <div className="space-y-4">
              <KinkTagSelector
                descriptors={descriptors.filter(
                  (d) => d.category !== "content_warnings"
                )}
                selectedIds={value.descriptors.map((t) => t.descriptor_id)}
                onChange={(ids) => {
                  const currentIds = value.descriptors.map((t) => t.descriptor_id);
                  const removedIds = currentIds.filter((id) => !ids.includes(id));
                  const addedIds = ids.filter((id) => !currentIds.includes(id));

                  let newDescriptors = value.descriptors.filter(
                    (t) => !removedIds.includes(t.descriptor_id)
                  );

                  addedIds.forEach((id) => {
                    newDescriptors.push({
                      id: `${Date.now()}-${id}`,
                      descriptor_id: id,
                      intensity: 3,
                      notes: "",
                    });
                  });

                  onChange({ ...value, descriptors: newDescriptors });
                }}
                placeholder="Add scene descriptors..."
              />

              <ScrollShadow className="max-h-[300px]">
                <div className="space-y-2">
                  {value.descriptors.map((tag) => {
                    const descriptor = getDescriptor(tag.descriptor_id);
                    if (!descriptor) return null;

                    const isEditing = editingTag === tag.id;

                    return (
                      <Card key={tag.id} className="bg-default-50">
                        <CardBody className="p-3">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium">{descriptor.name}</span>
                                  <p className="text-xs text-default-500">
                                    {descriptor.category}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="light"
                                    color="success"
                                    onPress={saveEdit}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="light"
                                    color="danger"
                                    onPress={cancelEdit}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <IntensitySlider
                                value={editForm?.intensity || 3}
                                onChange={(val) =>
                                  setEditForm((prev) =>
                                    prev ? { ...prev, intensity: val } : null
                                  )
                                }
                                label="Scene Intensity"
                              />
                              <Textarea
                                label="Implementation Notes"
                                value={editForm?.notes || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev ? { ...prev, notes: e.target.value } : null
                                  )
                                }
                                size="sm"
                                placeholder="How this appears in the scene..."
                              />
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{descriptor.name}</span>
                                  <Chip size="sm" variant="flat" color="primary">
                                    {descriptor.category}
                                  </Chip>
                                  <IntensityBadge value={tag.intensity} />
                                </div>
                                {tag.notes && (
                                  <p className="text-sm text-default-500 mt-1">
                                    {tag.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  onPress={() => startEdit(tag)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  color="danger"
                                  onPress={() => removeTag(tag.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </ScrollShadow>
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
}
