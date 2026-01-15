using System.Collections.Generic;
using System.Linq;
using RimWorld;
using Verse;

namespace TowerDefenseMod.Towers
{
    // Custom worker for tower upgrades
    public class RecipeWorker_UpgradeTowerMk1ToMk2 : RecipeWorker
    {
        public override void ConsumeIngredient(Thing ingredient, RecipeDef recipe, Map map)
        {
            base.ConsumeIngredient(ingredient, recipe, map);
        }

        public override bool AvailableOnNow(Thing thing, BodyPartRecord part = null)
        {
            if (thing?.def?.defName == null)
                return false;

            // Only available on Mk1 towers
            return thing.def.defName == "TD_Tower_Mk1";
        }

        // This is called when the recipe is completed
        public override void Notify_IterationCompleted(Pawn billDoer, List<Thing> ingredients)
        {
            base.Notify_IterationCompleted(billDoer, ingredients);
            // The actual upgrade will be handled in a custom toil
        }

        // Override to add a finish action
        public override IEnumerable<Thing> FinishAction(RecipeDef recipe, Pawn actor, List<Thing> ingredients, Thing dominantIngredient, IBillGiver billGiver)
        {
            // Perform the upgrade
            Building tower = billGiver as Building;
            if (tower != null && tower.def.defName == "TD_Tower_Mk1")
            {
                TowerUpgradeUtility.UpgradeTower(tower, "TD_Tower_Mk2");
            }

            return Enumerable.Empty<Thing>();
        }
    }
}
