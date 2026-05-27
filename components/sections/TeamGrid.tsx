"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SanityProfessor } from "@/lib/sanity/types";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils/cn";

interface TeamGridProps {
  members: SanityProfessor[];
  className?: string;
  isDirectorSection?: boolean;
}

function TeacherCard({ member }: { member: SanityProfessor }) {
  const photoUrl = member.photo
    ? urlFor(member.photo).width(480).height(640).url()
    : null;

  return (
    <motion.article variants={staggerItem} className="flex flex-col">
      <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-brand-md transition-shadow duration-500 cursor-default">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0,0,0.2,1)] group-hover:scale-105 will-change-transform"
          />
        ) : (
          <PlaceholderImage
            className="w-full h-full rounded-none border-none"
            label={member.name}
          />
        )}

        {/* Bio overlay — fades in on hover */}
        {member.bio && (
          <div className="absolute inset-0 z-10 bg-gray-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center p-6 pointer-events-none">
            <p className="text-white/85 text-sm leading-relaxed line-clamp-6 text-center">
              {member.bio}
            </p>
          </div>
        )}
      </div>

      {/* Name + role — below photo */}
      <div className="mt-3 px-1">
        <h3 className="text-gray-900 text-lg font-bold leading-tight">
          {member.name}
        </h3>
        <p className="text-brand-pink-500 text-sm font-semibold mt-0.5">
          {member.role}
        </p>
      </div>

      {/* Specialties */}
      {member.specialties && member.specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 px-1">
          {member.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-sm font-semibold px-3 py-1.5 rounded-full bg-brand-light text-brand-purple-700 border border-brand-purple-100"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}

function DirectorCard({ member }: { member: SanityProfessor }) {
  const photoUrl = member.photo
    ? urlFor(member.photo).width(480).height(640).url()
    : null;

  return (
    <motion.article
      variants={staggerItem}
      className="flex flex-col sm:flex-row overflow-hidden rounded-3xl bg-white border border-brand-purple-100 shadow-brand-md max-w-2xl mx-auto w-full"
    >
      {/* Photo */}
      <div className="relative w-full sm:w-56 flex-shrink-0 aspect-[3/4] sm:aspect-auto overflow-hidden bg-gray-100">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 100vw, 224px"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage
            className="w-full h-full rounded-none border-none"
            label={member.name}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center px-8 py-8">
        <span className="text-xs font-bold text-brand-purple-600 uppercase tracking-widest mb-4">
          Direção Artística
        </span>
        <h3 className="text-3xl font-extrabold text-gray-900 leading-tight">
          {member.name}
        </h3>
        <p className="text-brand-pink-500 text-base font-semibold mt-2">
          {member.role}
        </p>
        {member.bio && (
          <p className="text-gray-500 text-base leading-relaxed mt-4 line-clamp-5">
            {member.bio}
          </p>
        )}
        {member.specialties && member.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {member.specialties.map((s) => (
              <span
                key={s}
                className="text-sm font-semibold px-3 py-1.5 rounded-full bg-brand-light text-brand-purple-700 border border-brand-purple-100"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default function TeamGrid({
  members,
  className,
  isDirectorSection,
}: TeamGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={cn(
        isDirectorSection
          ? "flex flex-col items-center"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10",
        className
      )}
    >
      {members.map((member) =>
        isDirectorSection ? (
          <DirectorCard key={member._id} member={member} />
        ) : (
          <TeacherCard key={member._id} member={member} />
        )
      )}
    </motion.div>
  );
}
