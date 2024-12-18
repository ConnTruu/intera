import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
  } from "@chakra-ui/react"
  import { useMutation, useQueryClient } from "@tanstack/react-query"
  import { type SubmitHandler, useForm } from "react-hook-form"
  
  import { type ApiError, type FlashcardCreate, FlashcardsService } from "../../client"
  import useCustomToast from "../../hooks/useCustomToast"
  import { handleError } from "../../utils"
  
  interface AddFlashcardProps {
    isOpen: boolean
    onClose: () => void
  }
  
  const AddFlashcard = ({ isOpen, onClose }: AddFlashcardProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<FlashcardCreate>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: {
        question: "",
        answer: "",
      },
    })
  
    const mutation = useMutation({
      mutationFn: (data: FlashcardCreate) =>
        FlashcardsService.createFlashcard({ requestBody: data }),
      onSuccess: () => {
        showToast("Success!", "Flashcard created successfully.", "success")
        reset()
        onClose()
      },
      onError: (err: ApiError) => {
        handleError(err, showToast)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["flashcards"] })
      },
    })
  
    const onSubmit: SubmitHandler<FlashcardCreate> = (data) => {
      mutation.mutate(data)
    }
  
    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size={{ base: "sm", md: "md" }}
          isCentered
        >
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Add Flashcard</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired isInvalid={!!errors.question}>
                <FormLabel htmlFor="question">Question</FormLabel>
                <Input
                  id="question"
                  {...register("question", {
                    required: "Question is required.",
                  })}
                  placeholder="Question"
                  type="text"
                />
                {errors.question && (
                  <FormErrorMessage>{errors.question.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl mt={4}>
                <FormLabel htmlFor="answer">Answer</FormLabel>
                <Input
                  id="answer"
                  {...register("answer")}
                  placeholder="Answer"
                  type="text"
                />
              </FormControl>
            </ModalBody>
  
            <ModalFooter gap={3}>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}
  
  export default AddFlashcard