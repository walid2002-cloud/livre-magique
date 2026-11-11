"use client";

import { useEffect, useState } from "react";
import { getFile } from "@/lib/files";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function WelcomeSlot({ part }: { part: "photo" | "video" }) {
  const { db } = useApp();
  const { t } = useI18n();
  const [photo, setPhoto] = useState("");
  const [video, setVideo] = useState("");

  useEffect(() => {
    let photoUrl = "";
    let videoUrl = "";
    const photoId = db.studio.welcomePhotoId;
    const videoId = db.studio.welcomeVideoId;
    if (photoId) {
      getFile(photoId).then((file) => {
        if (!file) return;
        photoUrl = URL.createObjectURL(file);
        setPhoto(photoUrl);
      });
    } else setPhoto("");
    if (videoId) {
      getFile(videoId).then((file) => {
        if (!file) return;
        videoUrl = URL.createObjectURL(file);
        setVideo(videoUrl);
      });
    } else setVideo("");
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [db.studio.welcomePhotoId, db.studio.welcomeVideoId]);

  if (part === "video") {
    return video ? <video className="teacher-video" src={video} controls playsInline controlsList="nodownload" /> : null;
  }

  return (
    <figure className="teacher-badge">
      <img src={photo || "/mohssine.jpg"} alt={t.teacher} />
      <figcaption>
        <small>{t.teacherRole}</small>
        {t.teacher}
      </figcaption>
    </figure>
  );
}
