import {
    Container,
    Heading,
    SkeletonText,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
  } from "@chakra-ui/react"
  import { useQuery, useQueryClient } from "@tanstack/react-query"
  import { createFileRoute, useNavigate } from "@tanstack/react-router"
  import { useEffect } from "react"
  import { z } from "zod"
  
  import { FlashcardsService } from "../../client"
  import ActionsMenu from "../../components/Common/ActionsMenu"
  import Navbar from "../../components/Common/Navbar"
  import AddFlashcard from "../../components/Flashcards/AddFlashcard"
  import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"
  
  const flashcardsSearchSchema = z.object({
    page: z.number().catch(1),
  })
  
  export const Route = createFileRoute("/_layout/flashcards")({
    component: Flashcards,
    validateSearch: (search) => flashcardsSearchSchema.parse(search),
  })
  
  const PER_PAGE = 5

  function getFlashcardsQueryOptions({ page }: { page: number }) {
    return {
      queryFn: () =>
        FlashcardsService.readFlashcards({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
      queryKey: ["flashcards", { page }],
    }
  }
  
  function FlashcardsTable() {
    const queryClient = useQueryClient()
    const { page } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    const setPage = (page: number) =>
      navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })
  
    const {
      data: flashcards,
      isPending,
      isPlaceholderData,
    } = useQuery({
      ...getFlashcardsQueryOptions({ page }),
      placeholderData: (prevData) => prevData,
    })
  
    const hasNextPage = !isPlaceholderData && flashcards?.data.length === PER_PAGE
    const hasPreviousPage = page > 1
  
    useEffect(() => {
      if (hasNextPage) {
        queryClient.prefetchQuery(getFlashcardsQueryOptions({ page: page + 1 }))
      }
    }, [page, queryClient, hasNextPage])
  
    return (
      <>
        <TableContainer>
          <Table size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Question</Th>
                <Th>Answer</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            {isPending ? (
              <Tbody>
                <Tr>
                  {new Array(4).fill(null).map((_, index) => (
                    <Td key={index}>
                      <SkeletonText noOfLines={1} paddingBlock="16px" />
                    </Td>
                  ))}
                </Tr>
              </Tbody>
            ) : (
              <Tbody>
                {flashcards?.data.map((flashcard) => (
                  <Tr key={flashcard.id} opacity={isPlaceholderData ? 0.5 : 1}>
                    <Td>{flashcard.id}</Td>
                    <Td isTruncated maxWidth="150px">
                      {flashcard.question}
                    </Td>
                    <Td
                      color={!flashcard.answer ? "ui.dim" : "inherit"}
                      isTruncated
                      maxWidth="150px"
                    >
                      {flashcard.answer || "N/A"}
                    </Td>
                    <Td>
                      <ActionsMenu type={"Flashcard"} value={flashcard} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            )}
          </Table>
        </TableContainer>
        <PaginationFooter
          page={page}
          onChangePage={setPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </>
    )
  }
  
  function Flashcards() {
    return (
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Flashcards Management
        </Heading>
  
        <Navbar type={"Flashcard"} addModalAs={AddFlashcard} />
        <FlashcardsTable />
      </Container>
    )
  }
  