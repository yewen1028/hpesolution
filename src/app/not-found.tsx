import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="py-32 sm:py-48">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Error 404</p>
          <h1 className="display-1 mt-6">This page is not in service.</h1>
          <p className="lede mt-7">
            The address you followed does not match anything on this site. The
            services, case studies and centre directory are all reachable from
            the links below.
          </p>
          <div className="mt-11 flex flex-wrap gap-4">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/services" variant="ghost">
              Browse services
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
