import fs from 'fs';

import { apiRoot } from './common';

// API data types
import type { APICourse, GECourse } from '@prisma/client';

function sniffGWRCourses(inFile: string, outFile: string) {
  console.log(`starting sniffGWRcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData = JSON.parse(fs.readFileSync(inFile, 'utf8')) as APICourse[];
  const gwrCourses: string[] = [];

  // linter erroneously detecting we could use for-of when we need iterator i
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < courseData.length; i += 1) {
    const c = courseData[i];
    if (c.addl.includes('GWR\n') || c.addl.includes('GWR;')) {
      courseData[i].gwrCourse = true;
      gwrCourses.push(`${c.catalog}-${c.id}`);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(gwrCourses, null, 2));
  fs.writeFileSync(inFile, JSON.stringify(courseData, null, 2));
  console.log(
    `successfully wrote sniffed GWR courses to ${outFile} and updated original course data`
  );
}
function sniffUSCPCourses(inFile: string, outFile: string) {
  console.log(`starting sniffUSCPcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData = JSON.parse(fs.readFileSync(inFile, 'utf8')) as APICourse[];
  const uscpCourses: string[] = [];

  // linter erroneously detecting we could use for-of when we need iterator i
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < courseData.length; i += 1) {
    const c = courseData[i];
    if (c.addl.includes('USCP\n') || c.addl.includes('USCP;')) {
      courseData[i].uscpCourse = true;
      uscpCourses.push(`${c.catalog}-${c.id}`);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(uscpCourses, null, 2));
  fs.writeFileSync(inFile, JSON.stringify(courseData, null, 2));
  console.log(
    `successfully wrote sniffed USCP courses to ${outFile} and updated original course data`
  );
}
function sniffGECourses(inFile: string, outFile: string) {
  console.log(`starting sniffGEcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData = JSON.parse(fs.readFileSync(inFile, 'utf8')) as APICourse[];
  const geCourses: GECourse[] = [];

  for (const c of courseData) {
    if (c.addl.includes('GE Area 1A\n') || c.addl.includes('GE Area 1A;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_1A'
      });
    }
    if (c.addl.includes('GE Area 1B\n') || c.addl.includes('GE Area 1B;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_1B'
      });
    }
    if (c.addl.includes('GE Area 1C\n') || c.addl.includes('GE Area 1C;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_1C'
      });
    }
    if (c.addl.includes('GE Area 5A\n') || c.addl.includes('GE Area 5A;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_5A'
      });
    }
    if (c.addl.includes('GE Area 5B\n') || c.addl.includes('GE Area 5B;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_5B'
      });
    }
    if (c.addl.includes('GE Area 5C\n') || c.addl.includes('GE Area 5C;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_5C'
      });
    }
    if (c.addl.includes('GE Area 2\n') || c.addl.includes('GE Area 2;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_2'
      });
    }
    if (c.addl.includes('Upper-Div GE Area 2/5\n') || c.addl.includes('Upper-Div GE Area 2/5;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'UPPER_DIVISION_2_5'
      });
    }
    if (c.addl.includes('GE Area 3A\n') || c.addl.includes('GE Area 3A;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_3A'
      });
    }
    if (c.addl.includes('GE Area 3B\n') || c.addl.includes('GE Area 3B;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_3B'
      });
    }
    if (c.addl.includes('Upper-Div GE Area 3\n') || c.addl.includes('Upper-Div GE Area 3;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'UPPER_DIVISION_3'
      });
    }
    if (c.addl.includes('GE Area 4A\n') || c.addl.includes('GE Area 4A;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_4A'
      });
    }
    if (c.addl.includes('GE Area 4B\n') || c.addl.includes('GE Area 4B;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_4B'
      });
    }
    if (c.addl.includes('Upper-Div GE Area 4\n') || c.addl.includes('Upper-Div GE Area 4;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'UPPER_DIVISION_4'
      });
    }
    if (c.addl.includes('GE Area 6\n') || c.addl.includes('GE Area 6;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'GE_6'
      });
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(geCourses, null, 2));
  fs.writeFileSync(inFile, JSON.stringify(courseData, null, 2));
  console.log(
    `successfully wrote sniffed GE courses to ${outFile} and updated original course data`
  );
}

function findGWRUSCPGECoursesAllCatalogs() {
  // will sniff out GWR & USCP courses in all catalogs
  // ***MAKE SURE TO STILL MANUALLY VERIFY!***

  const catalogYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  for (const f of catalogYears) {
    console.log(`sniffing GWR courses for catalog ${f}`);
    sniffGWRCourses(
      `${apiRoot}/data/courses/${f}/${f}.json`,
      `${apiRoot}/data/courses/${f}/${f}-GWR.json`
    );

    console.log(`sniffing USCP courses for ${f}`);
    sniffUSCPCourses(
      `${apiRoot}/data/courses/${f}/${f}.json`,
      `${apiRoot}/data/courses/${f}/${f}-USCP.json`
    );

    console.log(`sniffing GE courses for ${f}`);
    sniffGECourses(
      `${apiRoot}/data/courses/${f}/${f}.json`,
      `${apiRoot}/data/courses/${f}/${f}-GE.json`
    );
  }
}

// run after we generate courses using cpslo-courses as it requires that folder structure to exist
findGWRUSCPGECoursesAllCatalogs();
