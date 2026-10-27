#!/usr/bin/env python3
"""Set up dependencies and run or build the BKM Kaplanlar server."""

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys


ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Build or run the BKM Kaplanlar website server.",
        epilog=(
            "Running requires ADMIN_PASSWORD in the environment. "
            "By default, cookies are configured for local HTTP development; "
            "use --secure-cookies when serving through HTTPS."
        ),
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="build the server binary instead of starting the development server",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="binary output path for --build (default: ./bkm-kaplanlar)",
    )
    parser.add_argument(
        "--secure-cookies",
        action="store_true",
        help="enable Secure admin cookies for HTTPS (run mode only)",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    go = shutil.which("go")
    if go is None:
        parser.error("Go is required but was not found on PATH.")
    if not (BACKEND / "go.mod").is_file() or not (BACKEND / "main.go").is_file():
        parser.error(f"backend source files were not found in {BACKEND}.")

    if args.build:
        output = args.output or ROOT / "bkm-kaplanlar"
        if not output.is_absolute():
            output = (Path.cwd() / output).resolve()
        if sys.platform == "win32" and output.suffix.lower() != ".exe":
            output = output.with_suffix(".exe")
        output.parent.mkdir(parents=True, exist_ok=True)
        command = [go, "build", "-o", str(output), "."]
        os.chdir(BACKEND)
        print(f"Building server binary: {output}", flush=True)
        return subprocess.run(command, check=False).returncode

    if not os.environ.get("ADMIN_PASSWORD", "").strip():
        parser.error(
            "ADMIN_PASSWORD is not set. Set it in the environment before running "
            "the server; the password is never stored in this script."
        )

    environment = os.environ.copy()
    environment["ADMIN_COOKIE_SECURE"] = "true" if args.secure_cookies else "false"
    print("Starting BKM Kaplanlar at http://localhost:3000", flush=True)
    if not args.secure_cookies:
        print(
            "Local HTTP mode: admin cookies are not Secure. "
            "Use --secure-cookies when serving through HTTPS.",
            flush=True,
        )
    try:
        os.chdir(BACKEND)
        return subprocess.run(
            [go, "run", "."],
            env=environment,
            check=False,
        ).returncode
    except KeyboardInterrupt:
        print("\nServer stopped.", flush=True)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
