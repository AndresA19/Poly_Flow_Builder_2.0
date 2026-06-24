import { ObjectMap } from '$lib/common/util/ObjectMap';
import { computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import { FLOW_TERM_COUNT_MAX } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export function performAddTerms(termAddIdxs: number[], flowchart: Flowchart): Flowchart {
  const newFlowchart = flowchart;
  const existingTermIndexes = new Set(flowchart.termData.map((t) => t.tIndex));

  termAddIdxs.forEach((tIndex) => {
    // if a term to be added already exists, ignore
    if (existingTermIndexes.has(tIndex)) {
      return;
    }

    let insertIdx = newFlowchart.termData.findIndex((t) => tIndex < t.tIndex);
    insertIdx = insertIdx !== -1 ? insertIdx : FLOW_TERM_COUNT_MAX - 1;

    newFlowchart.termData.splice(insertIdx, 0, {
      tIndex,
      tUnits: '0',
      courses: []
    });
  });

  return newFlowchart;
}

// effectively just a wrapper
export function performDeleteTerms(termDeleteIdxs: number[], flowchart: Flowchart): Flowchart {
  const newFlowchart = flowchart;
  newFlowchart.termData = newFlowchart.termData.filter(
    (termData) => !termDeleteIdxs.includes(termData.tIndex)
  );
  newFlowchart.unitTotal = computeTotalUnits(newFlowchart.termData, new ObjectMap(), new Map());
  return newFlowchart;
}

export function generateTermString(termIdx: number, flowStartYear: string): string {
  let termString = '';

  if (termIdx === -1) {
    termString = 'Credit Bin';
  } else {
    const yearOffset = Math.floor((termIdx - 1) / 3);
    const startingYear = parseInt(flowStartYear);
    const year = startingYear + yearOffset;

    switch (termIdx % 3) {
      case 0: {
        termString += 'Summer ' + (year + 1).toString();
        break;
      }
      case 1: {
        termString += 'Fall ' + year.toString();
        break;
      }
      case 2: {
        termString += 'Spring ' + (year + 1).toString();
        break;
      }
    }
  }

  return termString;
}