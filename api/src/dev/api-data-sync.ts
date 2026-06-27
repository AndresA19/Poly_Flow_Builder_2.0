import fs from 'fs';
import path from 'path';
import { ZodError } from 'zod';
import { apiRoot, getFiles } from './common';
import { Prisma, PrismaClient } from '@prisma/client';
import { flowchartValidationSchema } from '$lib/common/schema/flowchartSchema';
import type {
  Program,
  GECourse,
  APICourse,
  CourseRequisite,
  TemplateFlowchart,
  TermTypicallyOffered
} from '@prisma/client';

interface TemplateFlowchartMetadata {
  flows: Program[];
  cSheets: Program[];
}

const prisma = new PrismaClient();

async function clearAPIData() {
  console.log('clearing API data from database ...');

  await prisma.$transaction([
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Flowchart;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE TermTypicallyOffered;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE GECourse;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE CourseRequisite;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Course;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE TemplateFlowchart;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Program;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE StartYear;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Catalog;'),
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;')
  ]);
}

async function syncCatalogStartYears() {
  console.log('starting db sync of catalog and start years ...');

  const catalogYears = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  const startYears = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-start-years.json`, 'utf8')
  ) as string[];

  await prisma.catalog.createMany({
    data: catalogYears.map((catalog) => ({ catalog })),
    skipDuplicates: true
  });

  await prisma.startYear.createMany({
    data: startYears.map((year) => ({ year })),
    skipDuplicates: true
  });

  console.log('sync of catalog and start years complete');
}

async function syncCourseData() {
  console.log('starting db sync of course data ...');

  const catalogYears = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  for (const curCatalogYear of catalogYears) {
    const courseData = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}.json`, 'utf8')
    ) as APICourse[];

    const geCourseData = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-GE.json`, 'utf8')
    ) as GECourse[];

    const reqCourseData = JSON.parse(
      fs.readFileSync(
        `${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-req.json`,
        'utf8'
      )
    ) as CourseRequisite[];

    console.log('syncing course data for catalog', curCatalogYear);

    await prisma.aPICourse.createMany({
      data: courseData,
      skipDuplicates: true
    });

    if (fs.existsSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-override.json`)) {
      console.log('applying course override data for catalog', curCatalogYear);

      const courseOverrideData = JSON.parse(
        fs.readFileSync(
          `${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-override.json`,
          'utf8'
        )
      ) as APICourse[];

      for (const course of courseOverrideData) {
        console.log('update course', course.id);

        await prisma.aPICourse.update({
          data: {
            desc: course.desc,
            addl: course.addl
          },
          where: {
            id_catalog: {
              catalog: course.catalog,
              id: course.id
            }
          }
        });
      }
    }

    const apiCourses = await prisma.aPICourse.findMany({
      where: { catalog: curCatalogYear },
      select: { id: true, catalog: true }
    });

    const apiKeys = new Set(apiCourses.map((c) => `${c.id}::${c.catalog}`));

    console.log("First 20 APICourse keys:");
    console.table([...apiKeys].slice(0, 20));

    console.log("First 20 GE keys:");
    console.table(
      geCourseData.slice(0, 20).map((ge) => `${ge.id}::${ge.catalog}`)
    );

    const missingGECourses = geCourseData.filter(
      (ge) => !apiKeys.has(`${ge.id}::${ge.catalog}`)
    );

    await prisma.gECourse.createMany({
      data: geCourseData.filter((ge) => apiKeys.has(`${ge.id}::${ge.catalog}`)),
      skipDuplicates: true
    });

    await prisma.courseRequisite.createMany({
      data: reqCourseData.map((data) => ({
        catalog: data.catalog,
        id: data.id,
        prerequisite: data.prerequisite as Prisma.JsonArray,
        corequisite: data.corequisite as Prisma.JsonArray,
        recommended: data.recommended as Prisma.JsonArray,
        concurrent: data.concurrent as Prisma.JsonArray
      })),
      skipDuplicates: true
    });
  }

  console.log('db sync of course data finished successfully');
}

async function syncProgramData() {
  const programData = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  ) as TemplateFlowchartMetadata;

  console.log('syncing program data with db ...');

  await prisma.program.createMany({
    data: programData.flows,
    skipDuplicates: true
  });

  console.log('program sync complete');
}

async function syncTermTypicallyOfferedData() {
  const termTypicallyOfferedData = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-term-typically-offered.json`, 'utf8')
  ) as TermTypicallyOffered[];

  console.log('syncing term typically offered data with db ...');

  await prisma.termTypicallyOffered.createMany({
    data: termTypicallyOfferedData,
    skipDuplicates: true
  });

  console.log('term typically offered sync complete');
}

async function syncTemplateFlowcharts() {
  console.log('starting update of default flows to database ...');

  const flowDataLinks = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  ) as TemplateFlowchartMetadata;

  const defaultFlows: TemplateFlowchart[] = [];

  for await (const f of getFiles(`${apiRoot}/data/flows/json/dflows`)) {
    if (path.extname(f) === '.json') {
      console.log(`validating schema for ${f}`);

      try {
        const rawFlowData = JSON.parse(fs.readFileSync(f, 'utf8')) as Record<string, unknown>;

        const defaultFlowData = flowchartValidationSchema.parse({
          ...rawFlowData,
          lastUpdatedUTC: new Date(rawFlowData.lastUpdatedUTC as string)
        });

        const flowProgramData = flowDataLinks.flows.find(
          (flowDataLinkEntry) => flowDataLinkEntry.id === defaultFlowData.programId[0]
        );

        if (!flowProgramData) {
          console.log('FLOWPROGRAMDATA RETURNED UNDEFINED, SKIPPING');
          continue;
        }

        defaultFlows.push({
          programId: flowProgramData.id,
          flowUnitTotal: defaultFlowData.unitTotal,
          termData: defaultFlowData.termData,
          version: defaultFlowData.version
        });
      } catch (e) {
        if (e instanceof ZodError) {
          console.log('flowchart validation failed', e);
        } else {
          console.log('error occurred while getting flow-specific notes, skipping', e);
        }

        process.exit(-1);
      }
    }
  }

  await prisma.templateFlowchart.createMany({
    data: defaultFlows,
    skipDuplicates: true
  });

  console.log('finished updating default flows DB');
}

async function syncAllAPIData() {
  await clearAPIData();
  await syncCatalogStartYears();
  await syncCourseData();
  await syncProgramData();
  await syncTermTypicallyOfferedData();
  await syncTemplateFlowcharts();
}

if (process.env.API_DATA_SYNC_SETTINGS) {
  const options = process.env.API_DATA_SYNC_SETTINGS.split(',');
  console.log('found sync settings', options);

  if (options.includes('templateFlowcharts')) {
    console.log('syncing templateFlowcharts');
    await prisma.templateFlowchart.deleteMany();
    await syncTemplateFlowcharts();
  }

  if (options.includes('catalogStartYears')) {
    console.log('syncing catalogStartYears');
    await prisma.startYear.deleteMany();
    await syncCatalogStartYears();
  }
} else {
  console.log('no sync settings found, executing full replace');
  await syncAllAPIData();
}

await prisma.$disconnect();