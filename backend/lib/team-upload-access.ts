import type { PrismaClient } from '@prisma/client'

/** Просмотр/удаление материалов по блюдам: член команды, организатор/админ, судья с листом по этой команде */
export async function canAccessTeamUploadContent(
  prisma: PrismaClient,
  user: { id: string; role: string },
  teamId: string
): Promise<boolean> {
  if (['admin', 'organizer'].includes(user.role)) return true
  const member = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId },
  })
  if (member) return true
  const judging = await prisma.result.findFirst({
    where: { teamId, judgeId: user.id },
  })
  return !!judging
}
