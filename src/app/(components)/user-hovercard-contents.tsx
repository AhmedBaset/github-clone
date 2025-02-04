import * as React from "react";
// components
import { Avatar } from "./avatar";
import { LocationIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { clsx, excerpt } from "~/lib/shared-utils";

// types
import type { User } from "~/lib/db/schema/user.sql";
export type UserHoverCardContentsProps = {
  className?: string;
} & Omit<User, "preferred_theme" | "id" | "github_id">;

export function UserHoverCardContents({
  name,
  username,
  bio,
  location,
  avatar_url,
  className,
}: UserHoverCardContentsProps) {
  return (
    <div
      className={clsx(
        className,
        "flex flex-col gap-2 p-5 w-[300px] max-w-[300px]"
      )}
    >
      <Avatar size="medium" src={avatar_url} username={username} />
      <Link href={`/u/${username}`} className="group/hovercard-link">
        <span className="text-lg font-semibold group-hover/hovercard-link:text-accent">
          {username}
        </span>
        {name && (
          <>
            &nbsp;
            <span className="text-grey group-hover/hovercard-link:text-accent">
              {name}
            </span>
          </>
        )}
      </Link>
      {bio && <p>{excerpt(bio, 88)}</p>}
      {location && (
        <div className="text-grey flex items-center gap-1">
          <LocationIcon className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
}
