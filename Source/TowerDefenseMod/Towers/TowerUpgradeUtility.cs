using RimWorld;
using Verse;

namespace TowerDefenseMod.Towers
{
    public static class TowerUpgradeUtility
    {
        public static void UpgradeTower(Building oldTower, string newTowerDefName)
        {
            if (oldTower == null || oldTower.Map == null)
            {
                Log.Error("[Tower Defense] Cannot upgrade tower - tower or map is null");
                return;
            }

            ThingDef newTowerDef = DefDatabase<ThingDef>.GetNamed(newTowerDefName, false);
            if (newTowerDef == null)
            {
                Log.Error($"[Tower Defense] New tower def '{newTowerDefName}' not found!");
                return;
            }

            Map map = oldTower.Map;
            IntVec3 position = oldTower.Position;
            Rot4 rotation = oldTower.Rotation;
            Faction faction = oldTower.Faction;
            
            // Calculate hitpoints proportion to maintain damage state
            float hitPointsPct = (float)oldTower.HitPoints / (float)oldTower.MaxHitPoints;

            // Store any important state (power, etc) if needed
            bool wasPoweredOn = false;
            CompPowerTrader powerComp = oldTower.TryGetComp<CompPowerTrader>();
            if (powerComp != null)
            {
                wasPoweredOn = powerComp.PowerOn;
            }

            // Destroy old tower
            oldTower.Destroy(DestroyMode.Vanish);

            // Create and spawn new tower
            Thing newThing = ThingMaker.MakeThing(newTowerDef, oldTower.Stuff);
            Building newTower = newThing as Building;
            
            if (newTower == null)
            {
                Log.Error($"[Tower Defense] Failed to create new tower from def '{newTowerDefName}'");
                return;
            }

            GenSpawn.Spawn(newTower, position, map, rotation);
            newTower.SetFactionDirect(faction);

            // Restore hitpoints proportion
            newTower.HitPoints = (int)(newTower.MaxHitPoints * hitPointsPct);

            // Restore power state if applicable
            CompPowerTrader newPowerComp = newTower.TryGetComp<CompPowerTrader>();
            if (newPowerComp != null && wasPoweredOn)
            {
                // Power state is usually handled automatically
            }

            Log.Message($"[Tower Defense] Upgraded tower at {position} to {newTowerDef.label}");
            
            // Send message to player
            Messages.Message(
                "TD_TowerUpgraded".Translate(newTowerDef.label),
                newTower,
                MessageTypeDefOf.PositiveEvent
            );
        }
    }
}
