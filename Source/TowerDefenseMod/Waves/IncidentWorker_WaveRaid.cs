using System.Collections.Generic;
using System.Linq;
using RimWorld;
using Verse;
using Verse.AI.Group;

namespace TowerDefenseMod.Waves
{
    public class IncidentWorker_WaveRaid : IncidentWorker
    {
        protected override bool CanFireNowSub(IncidentParms parms)
        {
            // Only fire when manually triggered
            return parms.forced;
        }

        protected override bool TryExecuteWorker(IncidentParms parms)
        {
            Map map = (Map)parms.target;
            
            // Find a hostile faction
            Faction hostileFaction = Find.FactionManager.AllFactions
                .Where(f => f.HostileTo(Faction.OfPlayer) && !f.IsPlayer && !f.defeated)
                .RandomElementWithFallback();

            if (hostileFaction == null)
            {
                Log.Warning("[Tower Defense] No hostile faction found for wave raid");
                return false;
            }

            parms.faction = hostileFaction;

            // Generate pawns for the raid
            PawnGroupMakerParms pawnGroupMakerParms = new PawnGroupMakerParms
            {
                groupKind = PawnGroupKindDefOf.Combat,
                tile = map.Tile,
                faction = hostileFaction,
                points = parms.points,
                generateFightersOnly = true
            };

            List<Pawn> raiders = PawnGroupMakerUtility.GeneratePawns(pawnGroupMakerParms).ToList();

            if (raiders.Count == 0)
            {
                Log.Warning("[Tower Defense] No raiders generated for wave");
                return false;
            }

            // Spawn raiders at map edge
            IntVec3 spawnSpot;
            if (!CellFinder.TryFindRandomEdgeCellWith(
                (IntVec3 c) => c.Standable(map) && !c.Fogged(map),
                map,
                CellFinder.EdgeRoadChance_Hostile,
                out spawnSpot))
            {
                Log.Warning("[Tower Defense] Could not find spawn spot for wave");
                return false;
            }

            // Spawn pawns
            foreach (Pawn raider in raiders)
            {
                IntVec3 loc = CellFinder.RandomClosewalkCellNear(spawnSpot, map, 10);
                GenSpawn.Spawn(raider, loc, map);
            }

            // Create lord and make them assault
            LordMaker.MakeNewLord(hostileFaction, new LordJob_AssaultColony(hostileFaction, true, true, false, false, true), map, raiders);

            // Send letter to player
            Find.LetterStack.ReceiveLetter(
                "TD_WaveRaidLabel".Translate(),
                "TD_WaveRaidDesc".Translate(raiders.Count, hostileFaction.Name),
                LetterDefOf.ThreatBig,
                raiders[0]
            );

            Log.Message($"[Tower Defense] Wave spawned {raiders.Count} raiders from {hostileFaction.Name}");

            return true;
        }
    }
}
