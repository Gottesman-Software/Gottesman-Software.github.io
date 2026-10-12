import assert from "node:assert/strict";
import test from "node:test";

import { summarizeBenchmarks } from "./benchmark-summary.mjs";

test("counts each registered evidence record", () => {
  const html = `
    <article data-benchmark-record="stream"></article>
    <article data-benchmark-record="stream"></article>
    <article data-benchmark-record="literature"></article>
    <article data-benchmark-record="published-result" data-publication-tier="peer-reviewed"></article>
    <tr data-benchmark-record="hardware-test" data-status="planned"></tr>
  `;

  assert.deepEqual(summarizeBenchmarks(html), {
    researchStreams: 2,
    literatureAnchors: 1,
    publishedResults: 1,
    peerReviewedResults: 1,
    initialHardwareTests: 1,
    verifiedResults: 0,
  });
});

test("new registered records update the summary", () => {
  const original = '<article data-benchmark-record="literature"></article>';
  const extended = `${original}<article data-benchmark-record="literature"></article>`;

  assert.equal(summarizeBenchmarks(extended).literatureAnchors, 2);
});

test("verified results require a linked evidence artifact", () => {
  const html = `
    <tr data-benchmark-record="hardware-test" data-status="verified"></tr>
    <tr data-benchmark-record="hardware-test" data-status="verified" data-evidence-href=""></tr>
    <tr data-benchmark-record="hardware-test" data-status="verified" data-evidence-href="/evidence/run-001.json"></tr>
  `;

  assert.equal(summarizeBenchmarks(html).verifiedResults, 1);
});
