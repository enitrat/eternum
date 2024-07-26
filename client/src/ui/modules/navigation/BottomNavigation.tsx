import { useEntities } from "@/hooks/helpers/useEntities";
import { useQuestStore } from "@/hooks/store/useQuestStore";
import useRealmStore from "@/hooks/store/useRealmStore";
import useUIStore from "@/hooks/store/useUIStore";
import CircleButton from "@/ui/elements/CircleButton";
import { isRealmSelected } from "@/ui/utils/utils";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { guilds, leaderboard, quests as questsWindow } from "../../components/navigation/Config";
import { BuildingThumbs } from "./LeftNavigationModule";
import { QuestStatus, useUnclaimedQuestsCount, useQuests, useQuestClaimStatus } from "@/hooks/helpers/useQuests";
import { QuestId } from "@/ui/components/quest/questDetails";

export enum MenuEnum {
  realm = "realm",
  worldMap = "world-map",
  military = "military",
  construction = "construction",
  trade = "trade",
  resources = "resources",
  bank = "bank",
  worldStructures = "worldStructures",
  structures = "structures",
  leaderboard = "leaderboard",
  entityDetails = "entityDetails",
}

export const BottomNavigation = () => {
  const [location, _] = useLocation();

  const { realmEntityId } = useRealmStore();
  const { quests } = useQuests();
  const { unclaimedQuestsCount } = useUnclaimedQuestsCount();
  const { questClaimStatus } = useQuestClaimStatus();

  const togglePopup = useUIStore((state) => state.togglePopup);
  const isPopupOpen = useUIStore((state) => state.isPopupOpen);
  const selectedQuest = useQuestStore((state) => state.selectedQuest);

  const isWorldView = useMemo(() => location === "/map", [location]);

  const { playerStructures } = useEntities();
  const structures = useMemo(() => playerStructures(), [playerStructures]);

  const questToClaim = quests?.find((quest: any) => quest.status === QuestStatus.Completed);

  const secondaryNavigation = useMemo(() => {
    return [
      {
        button: (
          <div className="relative">
            <CircleButton
              tooltipLocation="top"
              image={BuildingThumbs.squire}
              label={questsWindow}
              active={isPopupOpen(questsWindow)}
              size="lg"
              onClick={() => togglePopup(questsWindow)}
              notification={isRealmSelected(realmEntityId, structures) ? unclaimedQuestsCount : undefined}
              notificationLocation={"topleft"}
              disabled={!isRealmSelected(realmEntityId, structures)}
            />

            {questToClaim && !isWorldView && (
              <div className="absolute bg-brown text-gold border-gradient border -top-12 w-32 animate-bounce px-1 py-1 flex uppercase">
                <ArrowDown className="text-gold w-4 mr-3" />
                <div className="text-xs">Claim your reward</div>
              </div>
            )}
          </div>
        ),
      },
      {
        button: (
          <CircleButton
            tooltipLocation="top"
            image={BuildingThumbs.leaderboard}
            label={leaderboard}
            active={isPopupOpen(leaderboard)}
            size="lg"
            onClick={() => togglePopup(leaderboard)}
            className={clsx({ hidden: !questClaimStatus[QuestId.Travel] })}
          />
        ),
      },
      {
        button: (
          <CircleButton
            tooltipLocation="top"
            image={BuildingThumbs.guild}
            label={guilds}
            active={isPopupOpen(guilds)}
            size="lg"
            onClick={() => togglePopup(guilds)}
            className={clsx({
              hidden: !questClaimStatus[QuestId.Travel],
            })}
          />
        ),
      },
    ];
  }, [unclaimedQuestsCount, selectedQuest, quests, realmEntityId]);

  const slideUp = {
    hidden: { y: "100%", transition: { duration: 0.3 } },
    visible: { y: "0%", transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex justify-center flex-wrap relative w-full duration-300 transition-all"
    >
      <div className="">
        <div className="flex py-2 px-10 gap-1 pointer-events-auto">
          {secondaryNavigation.map((a, index) => (
            <div key={index}>{a.button}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
