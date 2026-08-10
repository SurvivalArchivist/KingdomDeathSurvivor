## KDM Survivors Console 3.0.1

> [!CAUTION]
> # BREAKING CAMPAIGN RESET
> **Do not install 3.0.1 over a campaign you need to keep using.** Survivor files from earlier versions are rejected. Before installing, back up the survivor folder and app configuration. Then start with a new survivor folder and reselect every Data Source in Settings.

Version 3.0.1 removes the deferred legacy config, survivor-schema, template-folder, and `philosophyTenet` compatibility paths. It retains the complete LAN survivor-data feature set introduced in 3.0.0.

### Breaking Changes
- Survivor JSON must use schema version `6`; missing, invalid, older, and future versions are rejected.
- Legacy config containing only `dataPath` is ignored; configure current Data Sources again in Settings.
- The dedicated Tenet Knowledges Data Source and fallback are removed. Knowledge and Tenet Knowledge templates both use `knowledges`.
- The deprecated `philosophyTenet` survivor field is no longer accepted.

### Highlights
- New Settings modes: `Local Files`, `LAN Host`, and `LAN Client`.
- LAN Host serves survivor list, summary, load, save, delete, health, and live update endpoints from the configured local survivor folder.
- LAN Client reads and writes through the host while preserving the existing app workflow.
- Settlement refreshes automatically on connected clients when host survivor data changes.
- Automatic LAN discovery lets clients scan for hosts and fill the host address/port, with manual entry still available as a fallback.
- Compact navbar status shows Local, Hosting, Connected, Reconnecting, Offline, and Error states.
- Reliability hardening covers reconnects, disconnected write blocking, pre-save health checks, stale revision conflicts, validation failures, and clearer host unavailable/server error messages.
- Settings now includes explicit Start Host, Stop Host, Connect, Disconnect, displayed host URLs, and manual survivor-data backup export.

### Notes
- LAN discovery is best-effort and can be blocked by operating system firewalls, VPNs, or router broadcast settings. Manual host address entry remains supported.
- The hosting machine remains authoritative for survivor files. Before a long session, use the Settings backup export if you want a quick copy of the survivor folder.

### Downloads
- Windows: use the `setup.exe` asset for installation, or `portable.exe` if you specifically want the portable build.
- macOS: use the `.dmg` asset first (recommended), or `.zip` if needed.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
