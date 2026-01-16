using System.Collections.Generic;
using System.Linq;
using RimWorld;
using Verse;

namespace TowerDefenseMod.Towers
{
    // Custom worker for tower upgrades
    public class RecipeWorker_UpgradeTowerMkIToMkII : RecipeWorker
    {
        public override void ConsumeIngredient(Thing ingredient, RecipeDef recipe, Map map)
        {
            base.ConsumeIngredient(ingredient, recipe, map);
        }

        public override bool AvailableOnNow(Thing thing, BodyPartRecord part = null)
        {
            if (thing?.def?.defName == null)
                return false;

            // Only available on MkI towers
            return thing.def.defName == "TD_Tower_MkI";
        }

        // This is called when the recipe is completed
        public override void Notify_IterationCompleted(Pawn billDoer, List<Thing> ingredients)
        {
            base.Notify_IterationCompleted(billDoer, ingredients);
            
            // Find the tower (bill giver) and perform the upgrade
            Building tower = billDoer?.CurJob?.bill?.billStack?.billGiver as Building;
            if (tower != null && tower.def.defName == "TD_Tower_MkI")
            {
                TowerUpgradeUtility.UpgradeTower(tower, "TD_Tower_MkII");
            }
        }
    }
}
