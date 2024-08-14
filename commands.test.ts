import { describe, expect, it } from "vitest";

import Cmd from "./commands";
import fs from "fs";
import path from "path";

describe("commands", () => {
  it("Should do a mkdir", () => {
    Cmd.mkdir("test");
    expect(fs.existsSync("test")).toBe(true);
    fs.rmdirSync("test");
  });

  it("Should do a touch", () => {
    Cmd.touch("test.txt");
    expect(fs.existsSync("test.txt")).toBe(true);
    fs.unlinkSync("test.txt");
  });

  it("Should do a rm", () => {
    Cmd.touch("test.txt");
    Cmd.rm("test.txt");
    expect(fs.existsSync("test.txt")).toBe(false);
  });

  it("Should do cd", () => {
    const rootDir = process.cwd();
    Cmd.mkdir("test");
    Cmd.cd("test");
    expect(process.cwd()).toBe(path.join(rootDir, "test"));
    Cmd.cd("..");
    expect(process.cwd()).toBe(rootDir);
    fs.rmdirSync("test");
  });

  it("Should tell the pwd", () => {
    const rootDir = process.cwd();
    expect(Cmd.pwd()).toBe(rootDir);
  });

  it("Should do a mv", () => {
    Cmd.touch("test.txt");
    Cmd.mv("test.txt", "test2.txt");
    expect(fs.existsSync("test2.txt")).toBe(true);
    fs.unlinkSync("test2.txt");
  });

  it("Should do a cp", () => {
    Cmd.touch("test.txt");
    Cmd.cp("test.txt", "test2.txt");
    expect(fs.existsSync("test2.txt")).toBe(true);
    fs.unlinkSync("test.txt");
    fs.unlinkSync("test2.txt");
  });
  
});
