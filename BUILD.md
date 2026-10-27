# Build and run BKM Kaplanlar

This guide covers local development and building a standalone server. The Go
server listens on port `3000` and serves the website files from `web/`.

## Requirements

- Python 3.8 or later (only needed for the root `run.py` helper)
- Go 1.27.2 or later
- A free local port `3000`

Check that the tools are installed:

```bash
python3 --version
go version
```

## Run locally

From the repository root, set the admin password in your shell and launch the
helper. The helper does not contain or set a password; it requires
`ADMIN_PASSWORD` to already be present in the environment.

On macOS or Linux, enter the password without echoing it to the terminal:

```bash
read -rsp "Admin password: " ADMIN_PASSWORD
export ADMIN_PASSWORD
printf '\n'
python3 run.py
```

The first run downloads Go modules as needed. The helper starts the server from
the `backend/` directory, which is important because the server serves files
from the sibling `web/` directory. Open <http://localhost:3000> for the site
and <http://localhost:3000/admin> for the dashboard.

By default, `run.py` configures the admin cookie for local HTTP. This setting is
for development only; the cookie will not be marked `Secure`.

To see all helper options:

```bash
python3 run.py --help
```

To use the helper behind HTTPS, configure the password as above and run:

```bash
python3 run.py --secure-cookies
```

The HTTPS proxy must forward requests to the Go server. Use this option only
when the browser connects over HTTPS; otherwise, the browser will not send the
admin session cookie.

In PowerShell, set the password without saving it in the repository:

```powershell
$env:ADMIN_PASSWORD = Read-Host "Admin password"
python run.py
```

## Run tests

From the repository root:

```bash
cd backend
go test ./...
```

To also run Go's race detector:

```bash
go test -race ./...
```

## Build a standalone server

From the repository root:

```bash
python3 run.py --build
```

The default output is `bkm-kaplanlar` in the repository root (`bkm-kaplanlar.exe`
on Windows). Choose a different location with `--output`:

```bash
python3 run.py --build --output /tmp/bkm-kaplanlar
```

The binary must be started with `backend/` as its working directory so it can
find the website files. For example, on macOS or Linux:

```bash
cd backend
read -rsp "Admin password: " ADMIN_PASSWORD
export ADMIN_PASSWORD
export ADMIN_COOKIE_SECURE=false
printf '\n'
../bkm-kaplanlar
```

Set `ADMIN_PASSWORD` using your deployment environment or secret manager; do
not put the actual password in source code, command history, or this guide.
For local development, use the `read` command in the previous section instead
of the placeholder command above.

For production, serve the site through HTTPS and leave `ADMIN_COOKIE_SECURE`
unset (the backend enables secure cookies by default), or explicitly set it to
`true`. Do not use `ADMIN_COOKIE_SECURE=false` in production.

## Troubleshooting

- **`ADMIN_PASSWORD is not set`:** Set the variable in the same shell that
  starts `run.py`. The helper intentionally does not choose a default password.
- **Port 3000 is already in use:** Stop the other process using the port before
  starting this server.
- **Pages or assets return errors:** Run the helper from any directory, or
  when launching a built binary, make sure the current directory is `backend/`.
- **Admin login works but the dashboard loses its session:** For local HTTP,
  use the default `python3 run.py` mode. For HTTPS, use
  `python3 run.py --secure-cookies`.
- **Go modules cannot be downloaded:** Check the Go installation and network
  access, then rerun the command.

Admin sessions and page-view statistics are held in memory and are cleared
when the server stops. Statistics are aggregate counts; the server does not
store visitor IP addresses or identities.
