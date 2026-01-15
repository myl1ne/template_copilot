using System.Collections.Generic;
using RimWorld;
using UnityEngine;
using Verse;

namespace TowerDefenseMod.Waves
{
    public class Building_WaveConsole : Building
    {
        public override IEnumerable<Gizmo> GetGizmos()
        {
            foreach (Gizmo gizmo in base.GetGizmos())
            {
                yield return gizmo;
            }

            // Add "Start Next Wave" gizmo
            Command_Action startWave = new Command_Action();
            startWave.defaultLabel = "TD_StartWaveLabel".Translate();
            startWave.defaultDesc = "TD_StartWaveDesc".Translate();
            startWave.icon = ContentFinder<Texture2D>.Get("UI/Commands/Attack", true);
            startWave.action = delegate
            {
                WaveMapComponent waveComponent = Map?.GetComponent<WaveMapComponent>();
                if (waveComponent != null)
                {
                    waveComponent.StartNextWave();
                }
                else
                {
                    Log.Error("[Tower Defense] WaveMapComponent not found on map!");
                }
            };

            yield return startWave;
        }
    }
}
