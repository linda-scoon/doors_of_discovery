import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Marks a URL as safe to use as an `<iframe src>`.
 *
 * Angular refuses to bind a resource URL it cannot vouch for, which is why this
 * pipe exists. But bypassing that check hands the responsibility to us, and the
 * URLs we embed are built from third-party API responses — data we did not
 * write. So the URL is checked before it is trusted, and anything we do not
 * recognise is rejected rather than handed to the browser.
 *
 * Returns null for a rejected URL. Templates should not render the iframe at
 * all in that case.
 */
@Pipe({
  name: 'safe',
})
export class SafePipe implements PipeTransform {
  /**
   * Hosts we are willing to load an iframe from. Add a host here when a room
   * starts embedding from a new provider — nothing else needs to change.
   */
  private static readonly ALLOWED_EMBED_HOSTS: readonly string[] = [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'archive.org',
  ];

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl | null {
    if (!this.isAllowedEmbedUrl(url)) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private isAllowedEmbedUrl(url: string): boolean {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      // Not a URL at all. This is the normal case on first render, before the
      // API has responded and videoURL is still an empty string.
      return false;
    }

    // Rejecting anything but https also rules out the `javascript:` and `data:`
    // URLs that bypassing the sanitiser would otherwise let through.
    if (parsed.protocol !== 'https:') {
      return false;
    }

    return SafePipe.ALLOWED_EMBED_HOSTS.includes(parsed.hostname.toLowerCase());
  }
}
