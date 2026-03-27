"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { TeamMember } from "@/types";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { cn } from "@/lib/utils/cn";

interface TeamGridProps {
  members: TeamMember[];
  className?: string;
}

export default function TeamGrid({ members, className }: TeamGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6", className)}
    >
      {members.map((member) => (
        <motion.div
          key={member.id}
          variants={staggerItem}
          className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
        >
          <div className="aspect-square bg-gray-100 overflow-hidden relative">
            <PlaceholderImage className="w-full h-full rounded-none border-none" label={member.name} />
            {/* Bio hover overlay */}
            <div className="absolute inset-0 bg-brand-purple-600/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end p-4">
              {member.bio && (
                <p className="text-white/90 text-xs leading-relaxed line-clamp-5">{member.bio}</p>
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-sm leading-snug">{member.name}</h3>
            <p className="text-brand-purple-600 text-xs font-semibold uppercase tracking-wide mt-0.5">{member.role}</p>
            {member.specialties && member.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {member.specialties.slice(0, 2).map((s) => (
                  <span key={s} className="text-[10px] bg-brand-light text-brand-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
