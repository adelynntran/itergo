"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/lib/api/hooks";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
    setBio(profile.bio ?? "");
    setInterestInput((profile.interestTags ?? []).join(", "));
  }, [profile]);

  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const interestTags = interestInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSave = () => {
    updateProfile.mutate({
      displayName: displayName.trim(),
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      bio: bio.trim() ? bio.trim() : null,
      interestTags,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-full bg-background p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl leading-none text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Profile, identity, and travel preferences.</p>
      </div>

      <Card className="max-w-3xl border-border bg-card/85">
        <CardHeader>
          <CardTitle className="font-display text-3xl leading-none">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium text-foreground">{displayName || "Unnamed"}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your group what kind of traveler you are..."
              className="min-h-[100px]"
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interests">Interests (comma separated)</Label>
            <Input
              id="interests"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="books, cafes, hikes, local food, architecture"
            />
            {interestTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {interestTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
