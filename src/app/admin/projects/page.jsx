import { Suspense } from "react";
import { connection } from "next/server";
import { getProjectsRecord } from "@/services/projects";
import ProjectsClientView from "@/components/view/ProjectClient";
import Loading from "@/components/ui/Loading";

async function ProjectContent() {
  await connection();
  const projects = await getProjectsRecord();

  return <ProjectsClientView initialProjects={projects} />;
}

export default function Projects() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectContent />
    </Suspense>
  );
}
