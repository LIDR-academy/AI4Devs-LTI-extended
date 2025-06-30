const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTopCandidates(positionId) {
  try {
    const topCandidates = await prisma.application.findMany({
      where: {
        positionId: parseInt(positionId)
      },
      select: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        interviews: {
          select: {
            score: true
          }
        }
      }
    });

    // Calcular la puntuación media para cada candidato
    const candidatesWithScores = topCandidates.map(application => {
      const scores = application.interviews
        .map(interview => interview.score)
        .filter(score => score !== null);
      
      const averageScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      return {
        ...application.candidate,
        averageScore: parseFloat(averageScore.toFixed(2))
      };
    });

    // Ordenar por puntuación y obtener los 3 mejores
    const top3Candidates = candidatesWithScores
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3);

    console.log('Top 3 candidatos:');
    console.table(top3Candidates);

    await prisma.$disconnect();
    return top3Candidates;
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Obtener el positionId desde los argumentos de la línea de comandos
const positionId = process.argv[2];

if (!positionId) {
  console.error('Por favor, proporciona un positionId como argumento.');
  process.exit(1);
}

getTopCandidates(positionId);