import React from "react"
import { FaTrash } from "react-icons/fa"
import type { Member } from "../types/tenants.type"
import { getAvatarByIndex } from "../utlis/pickPicFromIndex"
import { useTranslation } from "react-i18next"

type Props = {
  member: Member
  owner?: Member
  currentUserId?: string | null
  isEditingMember: boolean
  isDeletingMember: boolean
  onRoleChange: (roleId: number, userUuid: string) => void
  onDelete: (userUuid: string) => void
}

const TenantMemberItem: React.FC<Props> = ({
  member,
  owner,
  currentUserId,
  isEditingMember,
  isDeletingMember,
  onRoleChange,
  onDelete,
}) => {
  const { t } = useTranslation()
  const canEditRole =
    isEditingMember &&
    member.user_uuid !== owner?.user_uuid &&
    member.role_name === "user"

  const canDelete =
    isDeletingMember &&
    member.user_uuid !== owner?.user_uuid &&
    member.user_uuid !== currentUserId

  return (
    <div
      className=" dark:bg-[#3b3b3b] bg-[#f5f5f5] rounded-lg p-2 px-3 gap-2 w-full flex flex-col
       items-start  text-[0.9rem]"
    >
      {/* USER */}
      <div className="flex items-center gap-3 min-w-0 w-full">
        <img src={getAvatarByIndex(member.profile_pic)} className='rounded-full h-9'/>

        <div className="min-w-0 capitalize w-full">
          <div className="truncate font-medium text-left">
            {member.display_name}
          </div>
        </div>
        {!isDeletingMember && (
          <div className="ml-auto">
            {member.is_active ? (
              <span className="bg-green-300 text-green-950 rounded-md px-2 py-0.5 text-[0.7rem] flex flex-row">
                {t("members.status.active")}
              </span>
            ) : (
              <span className="bg-red-300 text-red-950 rounded-md px-2 py-0.5 text-[0.7rem] flex flex-row">
               {t("members.status.offline")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ROLE */}
      <div className="w-full md:w-auto flex items-center gap-3 flex-wrap">
        {canEditRole ? (
          <select
            value={member.role_id}
            onChange={(e) => onRoleChange(Number(e.target.value), member.user_uuid)}
            className="bg-[#2c2c2c] p-1.5 rounded-md outline-none focus:outline-none focus:ring-0 text-[0.8rem]"
          >
            <option value={1}> {t("members.roles.user")}</option>
            <option className="text-[0.8rem]" value={2}>
              {t("members.roles.admin")}
            </option>
          </select>
        ) : (
          <span className="capitalize text-[0.8rem] text-gray-400">
            {member.role_name}
          </span>
        )}

        {canDelete && (
          <button
            type="button"
            className="inline-flex items-center justify-center hover:bg-red-300 p-1 text-[18px] bg-red-500 rounded-md"
            onClick={() => {
              onDelete(member.user_uuid)
            }}
            aria-label="Delete member"
          >
            <FaTrash />
          </button>
        )}

      {/* DATE */}
        <span className="text-[0.75rem] text-gray-500">•</span>
        <span className="text-[0.75rem] text-gray-400">
          {member.joined_at //FIX TO DO FUSOORARIO BACKEND
            ? new Date(member.joined_at).toLocaleString("it-IT", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : "Non disponibile"}
        </span>
      </div>

      {/* STATUS */}
      {!isDeletingMember && (
        <div className="hidden">
          {member.is_active ? (
            <span className="bg-green-300 text-green-950 rounded-md px-3 py-1 text-sm flex flex-row">
              {t("members.status.active")}
            </span>
          ) : (
            <span className="bg-red-300 text-red-950 rounded-md px-3 py-1 text-sm">
               {t("members.status.offline")}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default TenantMemberItem
