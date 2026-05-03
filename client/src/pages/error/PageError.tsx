import React from 'react'
import { Link } from 'react-router-dom'
import SEO from '@/components/ui/SEO'

const PAGE_NOT_FOUND_IMAGE = '/img3.jpg'

const PageError: React.FC = () => (
	<>
		<SEO
			title='Page introuvable – Nous sommes désolés'
			description="Désolé, la page que vous cherchez n'est pas disponible pour le moment."
		/>
		<section className='relative w-screen h-screen overflow-x-hidden py-10'>
			<div className='container relative z-40 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 h-full w-full'>
				<div className='max-w-full lg:max-w-[50%] flex-1 w-full h-full py-0 flex items-center justify-center flex-col gap-6 md:gap-8 lg:gap-10'>
					<div className='w-fit text-center'>
						<h1 className='bg-background text-5xl md:text-6xl lg:text-7xl font-bold'>
							<span className='bg-clip-text text-transparent bg-gradient-to-tr from-blue-500 via-[#c850c0] to-blue-500'>404</span>
						</h1>
						<h2 className='bg-background text-2xl md:text-3xl lg:text-5xl font-semibold'>
							Page introuvable
						</h2>
					</div>

					<p className='bg-background text-center text-base md:text-lg text-foreground/80'>
						Nous sommes désolés, la page que vous recherchez est introuvable.
					</p>

					<div className='w-full border bg-foreground/80 rounded-full shadow-md' />

					<div className='text-sm md:text-base mx-auto flex flex-wrap items-center gap-y-1 gap-4 md:gap-6 justify-center w-full capitalize'>
						<Link
							to='/'
							className='link-underline bg-clip-text text-transparent bg-gradient-to-tr from-blue-500 via-[#c850c0] to-blue-500 font-medium md:py-2'
						>
							<span>Retour à l'accueil</span>
						</Link>

						<Link
							to='/formations'
							className='link-underline bg-clip-text text-transparent bg-gradient-to-tr from-[#c850c0] to-blue-500 font-medium md:py-2'
						>
							<span>Voir les formations</span>
						</Link>

						<Link
							to='/a-propos'
							className='link-underline bg-clip-text text-transparent bg-gradient-to-tr from-blue-500 to-[#c850c0] font-medium md:py-2'
						>
							<span>En savoir plus</span>
						</Link>
					</div>
				</div>

				<div className='max-w-full lg:max-w-[50%] flex-1 w-full md:h-full flex items-center justify-center text-center'>
					<img
						src={PAGE_NOT_FOUND_IMAGE}
						alt='Illustration 404 page introuvable'
						loading='lazy'
						className='w-full h-full pointer-events-none select-none object-contain'
					/>
				</div>
			</div>
		</section>
	</>
)

export default PageError
