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
  
  import {
    type ApiError,
    type FlashcardPublic,
    type FlashcardUpdate,
    FlashcardsService,
  } from "../../client"
  import useCustomToast from "../../hooks/useCustomToast"
  import { handleError } from "../../utils"
  
  interface EditFlashcardProps {
    flashcard: FlashcardPublic
    isOpen: boolean
    onClose: () => void
  }
  
  const EditFlashcard = ({ flashcard, isOpen, onClose }: EditFlashcardProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
      register,
      handleSubmit,
      reset,
      formState: { isSubmitting, errors, isDirty },
    } = useForm<FlashcardUpdate>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: flashcard,
    })
  
    const mutation = useMutation({
      mutationFn: (data: FlashcardUpdate) =>
        FlashcardsService.updateFlashcard({ id: flashcard.id, requestBody: data }),
      onSuccess: () => {
        showToast("Success!", "Flashcard updated successfully.", "success")
        onClose()
      },
      onError: (err: ApiError) => {
        handleError(err, showToast)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["flashcards"] })
      },
    })
  
    const onSubmit: SubmitHandler<FlashcardUpdate> = async (data) => {
      mutation.mutate(data)
    }
  
    const onCancel = () => {
      reset()
      onClose()
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
            <ModalHeader>Edit Flashcard</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.question}>
                <FormLabel htmlFor="question">Question</FormLabel>
                <Input
                  id="question"
                  {...register("question", {
                    required: "Question is required",
                  })}
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
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                isDisabled={!isDirty}
              >
                Save
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
  
  export default EditFlashcard
  